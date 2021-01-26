import { ModelDeltaConfig } from "../api/ReplicationConfig";
import { NetworkStatusEvent } from "../network/NetworkStatus";
import { DocumentNode } from "graphql";
import { Client, OperationResult, CombinedError } from "urql";
import { convertFilterToGQLFilter } from "../utils/convertFilterToGQLFilter";
import { createLogger } from "../../utils/logger";
import { LocalStorage } from "../../storage";
import { Model } from "../../Model";
import { NetworkIndicator } from "../network/NetworkIndicator";
import { metadataModel, QueryMetadata } from "../api/MetadataModels";
import { Filter } from "../..";


const logger = createLogger("replicator-delta");

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
      logger("Online. Delta executing delta");
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
      } else {
        this.perform();
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
        logger("Delta about to be fetched");
        let lastSync = await this.loadLastSync();
        if (!lastSync) {
          lastSync = "0";
        }
        const filter = Object.assign({}, this.filter, { lastSync });
        const result = await this.options.client.query(this.options.query, filter).toPromise();
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

  /**
   * Apply filter to the delta query replication
   *
   * @param filter
   */
  public applyFilter(filter: Filter) {
    this.filter = convertFilterToGQLFilter(filter);
  }

  // TODO extract to separate result processor
  private async processResult(result: OperationResult<any>) {
    if (result.error) {
      logger("Delta error");
      throw result.error;
    }
    const model = this.options.model;
    if (result.data) {
      logger("Delta retrieved from server");
      const keys = Object.keys(result.data);
      if (keys.length !== 1) {
        logger(`Invalid GraphQL result. Please review your network requests: ${JSON.stringify(result.data)}`);
        return;
      }
      const firstOperationName = keys[0];
      const deltaResult = result.data[firstOperationName];

      await model.processDeltaChanges(deltaResult.items);
      await this.saveLastSync(deltaResult.lastSync);
    }
  }

  private async saveLastSync(lastSync: string) {
    const storeName = metadataModel.getStoreName();
    const idKey = metadataModel.getPrimaryKey();
    const objectToSave = { [idKey]: this.options.model.getStoreName(), lastSync };
    return await this.options.storage.saveOrUpdate(storeName, idKey, objectToSave);
  }

  private async loadLastSync(storage: LocalStorage = this.options.storage) {
    const storeName = metadataModel.getStoreName();
    const schema = this.options.model.schema;
    const item: QueryMetadata = await storage.queryById(storeName, metadataModel.getPrimaryKey(), schema.getStoreName());
    return item?.lastSync;
  }
}
