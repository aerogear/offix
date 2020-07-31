import { ModelDeltaConfig } from "../api/ReplicationConfig";
import { NetworkStatusEvent, NetworkStatus } from "../../network/NetworkStatus";
import { DocumentNode } from "graphql";
import { Client, OperationResult, CombinedError } from "urql";
import { convertPredicateToFilter } from "../utils/convertPredicateToFilter";
import { createLogger } from "../../utils/logger";
import { LocalStorage } from "../../storage";
import { Model } from "../../Model";

const logger = createLogger("deltareplicator");

export interface DeltaReplicatorConfig {
  config: ModelDeltaConfig;
  client: Client;
  networkInterface: NetworkStatus;
  query: DocumentNode;
  storage: LocalStorage;
  model: Model;
}

/**
 * Replication engine for delta queris
 */
export class DeltaReplicator {
  private options: DeltaReplicatorConfig;
  private filter: any;
  private activePullInterval?: number | any;
  private performLock: boolean = false;

  constructor(options: DeltaReplicatorConfig) {
    this.options = options;
    // Subscribe to network updates and open and close replication
    this.options.networkInterface.subscribe({
      next: (message: NetworkStatusEvent) => {
        if (message.isOnline) {
          this.start();
        }
      }
    });

    if (this.options.config.predicate) {
      this.filter = convertPredicateToFilter(this.options.config.predicate);
    } else {
      this.filter = {};
    }
  }

  public async start() {
    // If there is active pull available clear it
    if (this.activePullInterval) {
      clearInterval(this.activePullInterval);
    }
    // Only when online
    if (await this.options.networkInterface.isOnline()) {
      if (this.options.config.pullInterval) {
        this.perform().then(() => {
          this.activePullInterval = setInterval(() => {
            this.perform();
          }, this.options.config.pullInterval);
        }).catch((error: CombinedError) => {
          logger("Delta failed with error", error);
          // We cannot handle errors on delta apart from notifying user
          if (this.options.config.errorHandler) {
            const result = this.options.config.errorHandler(error.networkError, error.graphQLErrors);
            if (result) {
              // Retry if user want it
              this.perform();
            }
          }
        });
      }
    } else {
      logger("Offline. Delta suspended");
    }
  }

  public async perform() {
    // Check if perform loc is turned
    if (!this.performLock) {
      this.performLock = true;
      // TODO add limit
      const result = await this.options.client.query(this.options.query, this.filter).toPromise();
      this.processResult(result);
    } else {
      logger("Delta already processing. Interval suspended");
    }
  }

  private processResult(result: OperationResult<any>) {
    if (result.error) {
      this.performLock = false;
      throw result.error;
    }
    const model = this.options.model;
    // TODO this needs improvements on event level
    if (result.data && result.data.length > 0) {
      result.data
        .filter((d: any) => (d._deleted))
        .forEach((d: any) => {
          model.remove(d);
        });

      result.data
        .filter((d: any) => (!d._deleted))
        .forEach((d: any) => {
          (async () => {
            // TODO impove how we merge data together
            const results = await model.update(d);
            if (results.length === 0) {
              // no update was made, save the data instead
              model.save(d);
              return;
            }
          })();
        });
    } else {
      logger("No data returned by delta query");
    }
  }
}
