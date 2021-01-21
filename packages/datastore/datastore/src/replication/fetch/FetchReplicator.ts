import { Client } from "urql";
import { buildGraphQLCRUDQueries } from "..";
import { Filter, LocalStorage } from "../..";
import { Model } from "../../Model";
import { createLogger } from "../../utils/logger";
import { GlobalReplicationConfig } from "../api/ReplicationConfig";
import { NetworkIndicator } from "../network/NetworkIndicator";
import { DeltaReplicator } from "../queries/DeltaReplicator";
import { buildGraphQLCRUDSubscriptions } from "../subscriptions/buildGraphQLCRUDSubscriptions";
import { SubscriptionReplicator } from "../subscriptions/SubscriptionReplicator";

const logger = createLogger("replicator");

/**
 * Wrapper class for Delta query replication
 * and live update replicator
 */
export class FetchReplicator {
  /** Reference to model specific delta replicator */
  private deltaReplicator?: DeltaReplicator;
  /** Reference to model specific live update replicator */
  private subscriptionReplicator?: SubscriptionReplicator;
  /** Flag for if replication has started or not */
  private replicationFlag: Boolean = false;

  constructor(
    model: Model, 
    config: GlobalReplicationConfig, 
    storage: LocalStorage, 
    client: Client,
    networkIndicator: NetworkIndicator
  ) {
    if(config.delta?.enabled) {
      logger("Initializing delta replication");
      const queries = buildGraphQLCRUDQueries(model);
      const deltaOptions = {
        config: config.delta,
        client: client,
        networkIndicator: networkIndicator,
        storage,
        query: queries.sync,
        model: model
      };
      this.deltaReplicator = new DeltaReplicator(deltaOptions);
    }
    if (config.liveupdates?.enabled) {
      logger("Initializing subscription replication");
      const queries = buildGraphQLCRUDSubscriptions(model);
      const subscrptionOptions = {
        config: config.liveupdates,
        client: client,
        networkIndicator: networkIndicator,
        storage,
        queries: queries,
        model: model
      };
      this.subscriptionReplicator  = new SubscriptionReplicator(subscrptionOptions);
    }
    // provide the model with a reference to the replicator
    model.setReplicator(this);
  }

  /**
   * Start replication for a single model
   * 
   */
  public startReplication() {
    if (!this.replicationFlag) {
      this.stopReplication();
    }
    if (this.deltaReplicator) {
      this.deltaReplicator.start();
    }
    if (this.subscriptionReplicator) {
      this.subscriptionReplicator.start();
    }
    this.replicationFlag = true;
  }

  /**
   * Stop replication for a single model
   * 
   */
  public stopReplication() {
    if (this.replicationFlag) {
      if (this.deltaReplicator) {
        this.deltaReplicator.stop();
      }
      if (this.subscriptionReplicator) {
        // this.subscriptionReplicator.stop();
        // TODO stop subscriptions
      }
      this.replicationFlag = false;
    }
  }

  /**
   * Apply user defined filter to each
   * of the model's replicators
   * 
   * @param filter 
   */
  public applyFilter(filter: Filter) {
    this.deltaReplicator?.applyFilter(filter);
    this.subscriptionReplicator?.applyFilter(filter);
  }

  /**
   * Helper method to indicate if replication
   * for a model has started or not
   */
  public replicationStarted(): Boolean {
    return this.replicationFlag;
  }

}