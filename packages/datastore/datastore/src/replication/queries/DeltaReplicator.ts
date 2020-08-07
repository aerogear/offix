import { ModelDeltaConfig } from "../api/ReplicationConfig";
import { NetworkStatusEvent } from "../../network/NetworkStatus";
import { DocumentNode } from "graphql";
import { Client, OperationResult, CombinedError } from "urql";
import { convertFilterToGQLFilter } from "../utils/convertFilterToGQLFilter";
import { createLogger } from "../../utils/logger";
import { LocalStorage } from "../../storage";
import { Model } from "../../Model";
import { NetworkIndicator } from "../../network/NetworkIndicator";


const logger = createLogger("deltareplicator");

export interface DeltaReplicatorConfig {
  config: ModelDeltaConfig;
  client: Client;
  networkIndicator: NetworkIndicator;
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
  private activePullInterval?: number | undefined;
  // Some delta requests can take a while. We do not want to have two delta requests happening
  private performLock: boolean = false;

  constructor(options: DeltaReplicatorConfig) {
    this.options = options;
    // Subscribe to network updates and open and close replication
    this.options.networkIndicator.subscribe({
      next: (message: NetworkStatusEvent) => {
        if (message.isOnline) {
          if (this.activePullInterval) {
            // We just want to get extra delta when becoming online
            this.perform();
          } else {
            this.start();
          }
        } else {
          this.stop();
        }
      }
    });

    if (this.options.config.filter) {
      this.filter = convertFilterToGQLFilter(this.options.config.filter);
    } else {
      this.filter = {};
    }
  }

  public stop() {
    clearInterval(this.activePullInterval);
    this.activePullInterval = undefined;
  }

  public async start() {
    // Only when online
    if (await this.options.networkIndicator.isNetworkReachable()) {
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
      try {
        const result = await this.options.client.query(this.options.query, this.filter).toPromise();
        await this.processResult(result);
      } catch (error) {
        logger(`Replication error ${error}`);
      } finally {
        this.performLock = false;
      }
    } else {
      logger("Delta already processing. Interval suspended");
    }
  }

  private async processResult(result: OperationResult<any>) {
    if (result.error) {
      throw result.error;
    }
    const model = this.options.model;
    // TODO this needs improvements on event level
    if (result.data && result.data.length > 0) {
      const db = await this.options.storage.createTransaction();
      try {
        for (const item of result.data) {
          const filter = model.schema.getPrimaryKeyFilter(item);
          if (item._deleted) {
            await db.remove(model.getStoreName(), filter);
          } else {
            // TODO we need saveOrUpdate method
            const results = await db.update(model.getStoreName(), filter);
            if (results.length === 0) {
              // no update was made, save the data instead
              await db.save(model.getStoreName(), filter);
              return;
            }
          }
        }
      } catch (error) {
        db.rollback();
        throw error;
      }

      db.commit();
    }
  }
}
