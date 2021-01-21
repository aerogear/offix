import { ModelSubscriptionsConfig } from "../api/ReplicationConfig";
import { Client } from "urql";
import { createLogger } from "../../utils/logger";
import { LocalStorage, CRUDEvents } from "../../storage";
import { Model } from "../../Model";
import { NetworkIndicator } from "../network/NetworkIndicator";
import { ReplicatorSubscriptions } from "./ReplicatorSubscriptions";
import { convertFilterToGQLFilter } from "../utils/convertFilterToGQLFilter";
import { pipe, subscribe } from "wonka";
import { DocumentNode } from "graphql";
import { Filter } from "../..";
import { subscriptionT } from "wonka/dist/types/src/Wonka_types.gen";

const logger = createLogger("replicator-subscriptions");

export interface SubscriptionReplicatorConfig {
  config: ModelSubscriptionsConfig;
  client: Client;
  networkIndicator: NetworkIndicator;
  queries: ReplicatorSubscriptions;
  storage: LocalStorage;
  model: Model;
}

/**
 * Replication engine for delta queris
 */
export class SubscriptionReplicator {
  private options: SubscriptionReplicatorConfig;
  private filter: any;
  private wsConnected?: boolean;
  private addSubscription?: subscriptionT;
  private updateSubscription?: subscriptionT;
  private deleteSubscription? : subscriptionT;

  constructor(options: SubscriptionReplicatorConfig) {
    this.options = options;
    if (this.options.config.filter) {
      this.filter = convertFilterToGQLFilter(this.options.config.filter);
    } else {
      this.filter = {};
    }
  }

  public async start() {
    logger("Attempting subscribing to the changes");
    this.options.networkIndicator.wsObservable?.subscribe(({ isConnected }) => {
      if (this.wsConnected === undefined) {
        this.wsConnected = isConnected;
      } else if (this.wsConnected === isConnected) {
        // No state change
        return;
      }

      if (isConnected) {
        this.addSubscription = this.subscribeToChanges(this.options.queries.new, CRUDEvents.ADD);
        this.updateSubscription = this.subscribeToChanges(this.options.queries.updated, CRUDEvents.UPDATE);
        this.deleteSubscription = this.subscribeToChanges(this.options.queries.deleted, CRUDEvents.DELETE);
      }
    });
  }

  public applyFilter(filter: Filter) {
    this.filter = convertFilterToGQLFilter(filter);
  }

  /**
   * Stop subscriptions from the 
   * server and unsubscribe
   * 
   */
  public stop() {
    logger("Stopping subscriptions");
    this.addSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
    this.deleteSubscription?.unsubscribe();
  }

  private subscribeToChanges(query: DocumentNode, type: CRUDEvents) {
    return pipe(
      this.options.client.subscription(query, { filter: this.filter }),
      subscribe((result) => {
        if (result.error) {
          logger(`Subscription callback failed: ${JSON.stringify(result.error)}`);
          return;
        }
        if (result.data) {
          logger("Delta retrieved from server");
          const keys = Object.keys(result.data);
          if (keys.length !== 1) {
            logger(`Invalid GraphQL result. Please review your network requests: ${JSON.stringify(result.data)}`);
            return;
          }
          const firstOperationName = keys[0];
          const subsriptionData = result.data[firstOperationName];
          this.options.model.processSubscriptionChanges(subsriptionData, type);
        }
      })
    );
  };
}
