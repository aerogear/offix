import { LocalStorage } from "../storage";
import { Model } from "../Model";
import { WebNetworkStatus } from "../network/WebNetworkStatus";
import { NetworkIndicator } from "../network/NetworkIndicator";
import { GlobalReplicationConfig } from "./api/ReplicationConfig";
import { createGraphQLClient } from "./utils/createGraphQLClient";
import { Client } from "urql";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import invariant from "tiny-invariant";
import { createLogger } from "../utils/logger";
import { DeltaReplicator } from "./queries/DeltaReplicator";
import { buildGraphQLCRUDQueries } from ".";
import { buildGraphQLCRUDSubscriptions } from "./subscriptions/buildGraphQLCRUDSubscriptions";
import { SubscriptionReplicator } from "./subscriptions/SubscriptionReplicator";

const logger = createLogger("replicator");


/**
 * Defaults for replicating settings aggregated in single place
 * for visibility and documentation.
 */
export const defaultConfig: GlobalReplicationConfig = {
  // Prevent specifying required fields
  client: {
  } as any,
  // Delta, Mutations and Subscriptions defaults
  delta: {
    enabled: true,
    pullInterval: 1000 * 60 * 1 // 1 minute
  },
  liveupdates: {
    enabled: true
  },
  mutations: {
    enabled: true
  }
};

/**
 * Performs replication using GraphQL
 */
export class GraphQLReplicator {
  private client: Client;
  private config: GlobalReplicationConfig;
  private networkIndicator: NetworkIndicator;
  private models: Model[];
  private mutationQueue?: MutationsReplicationQueue;

  constructor(models: Model[], globalReplicationConfig: GlobalReplicationConfig) {
    this.models = models;
    this.config = Object.assign({}, defaultConfig, globalReplicationConfig);
    const graphqlClient = createGraphQLClient(this.config.client);
    this.client = graphqlClient.client;

    let systemNetworkStatus;
    if (this.config.networkStatus) {
      systemNetworkStatus = this.config.networkStatus;
    } else if (typeof window !== undefined) {
      systemNetworkStatus = new WebNetworkStatus();;
    } else {
      throw new Error("Missing network status interface ");
    }
    this.networkIndicator = new NetworkIndicator(systemNetworkStatus);
    this.networkIndicator.initialize(graphqlClient.subscriptionClient);
  }

  public init(storage: LocalStorage) {
    invariant(this.models.length, "No models provided for replication");

    if (this.config.mutations?.enabled) {
      logger("Initializing mutation replication");
      this.mutationQueue = new MutationsReplicationQueue({
        storage: storage,
        client: this.client,
        networkIndicator: this.networkIndicator
      });
      this.mutationQueue.init(this.models, this.config);
    }

    if (this.config.delta?.enabled) {
      logger("Initializing delta replication");
      for (const model of this.models) {
        const queries = buildGraphQLCRUDQueries(model);
        const deltaOptions = {
          config: this.config.delta,
          client: this.client,
          networkIndicator: this.networkIndicator,
          storage,
          query: queries.sync,
          model: model
        };
        const replicator = new DeltaReplicator(deltaOptions);
        replicator.start();
      }
    }

    if (this.config.liveupdates?.enabled) {
      logger("Initializing subscription replication");
      for (const model of this.models) {
        const queries = buildGraphQLCRUDSubscriptions(model);
        const subscrptionOptions = {
          config: this.config.liveupdates,
          client: this.client,
          networkIndicator: this.networkIndicator,
          storage,
          queries: queries,
          model: model
        };
        const replicator = new SubscriptionReplicator(subscrptionOptions);
        replicator.start();
      }
    }
  }
}
