import { LocalStorage } from "../storage";
import { Model } from "../Model";
import { WebNetworkStatus } from "./network/WebNetworkStatus";
import { NetworkIndicator } from "./network/NetworkIndicator";
import { GlobalReplicationConfig } from "./api/ReplicationConfig";
import { createGraphQLClient } from "./utils/createGraphQLClient";
import { Client } from "urql";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import invariant from "tiny-invariant";
import { createLogger } from "../utils/logger";
import { DeltaReplicator, DeltaReplicatorConfig } from "./queries/DeltaReplicator";
import { SubscriptionReplicator, SubscriptionReplicatorConfig } from "./subscriptions/SubscriptionReplicator";
import { buildGraphQLCRUDQueries } from "./queries/buildGraphQLCRUDQueries";
import { buildGraphQLCRUDSubscriptions } from "./subscriptions/buildGraphQLCRUDSubscriptions";
import { Filter } from "..";

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
  private storage?: LocalStorage;
  private deltaReplicators: Map<string, DeltaReplicator>;
  private liveUpdateReplicators: Map<string, SubscriptionReplicator>;

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
    this.deltaReplicators = new Map();
    this.liveUpdateReplicators = new Map();
  }

  public init(storage: LocalStorage) {
    invariant(this.models.length, "No models provided for replication");
    this.storage = storage;
    if (this.config.mutations?.enabled) {
      logger("Initializing mutation replication");
      this.models.forEach((model) => this.startModelMutationQueue(model));
    }
    if (this.config.delta?.enabled) {
      logger("Initializing delta replication");
      this.models.forEach((model) => {
        if (!model.isLateInit()) {
          this.startModelDeltaReplicator(model);
        }
      });
    }
    if (this.config.liveupdates?.enabled) {
      logger("Initializing subscription replication");
      this.models.forEach((model) => {
        if (!model.isLateInit()) {
          this.startModelSubscriptionReplicator(model);
        }
      });
    }
  }

  public startModelMutationQueue(model: Model) {
    invariant(this.storage, "No storage engine provided, unable to start replication");
    this.mutationQueue = new MutationsReplicationQueue({
      storage: this.storage,
      client: this.client,
      networkIndicator: this.networkIndicator
    });
    this.mutationQueue.init(this.models, this.config);
  }

  public startModelDeltaReplicator(model: Model, filter?: Filter) {
    const deltaOptions = this.getDeltaSyncOptions(model);
    const replicator = new DeltaReplicator(deltaOptions);
    if (filter) {
      logger("Applying delta replication filter");
      replicator.applyFilter(filter);
    }
    this.deltaReplicators.set(model.getName(), replicator);
    replicator.start();
  }

  public startModelSubscriptionReplicator(model: Model, filter?: Filter) {
    const subscrptionOptions = this.getSubscriptionReplicatorOptions(model);
    const replicator = new SubscriptionReplicator(subscrptionOptions);
    if (filter) {
      logger("Applying live update replication filter");
      replicator.applyFilter(filter);
    }
    this.liveUpdateReplicators.set(model.getName(), replicator);
    replicator.start();
  }

  public resartReplicators(model: Model, filter?: Filter) {
    if (this.config.delta?.enabled) {
      if (this.deltaReplicators.has(model.getName())) {
        const replicator = this.deltaReplicators.get(model.getName());
        logger("Stopping delta replicator");
        replicator?.stop();
        logger("Restarting delta replicator");
        replicator?.start();
      } else {
        this.startModelDeltaReplicator(model, filter);
      }
    }
    if (this.config.liveupdates?.enabled) {
      if (this.liveUpdateReplicators.has(model.getName())) {
        const replicator = this.liveUpdateReplicators.get(model.getName());
        logger("Stopping live update replicator");
        replicator?.stop();
        logger("Restarting live update replicator");
        replicator?.start();
      } else {
        this.startModelSubscriptionReplicator(model, filter);
      }
    }
  }

  private getDeltaSyncOptions(model: Model): DeltaReplicatorConfig {
    invariant(this.config.delta, "No delta replication config provided");
    invariant(this.storage, "No storage engine provided, unable to start replication");
    return {
      config: this.config.delta,
      client: this.client,
      networkIndicator: this.networkIndicator,
      storage: this.storage,
      query: buildGraphQLCRUDQueries(model).sync,
      model: model
    };
  }

  private getSubscriptionReplicatorOptions(model: Model): SubscriptionReplicatorConfig {
    invariant(this.config.liveupdates, "No subscription replication config provided");
    invariant(this.storage, "No storage engine provided, unable to start replication");
    return {
      config: this.config.liveupdates,
      client: this.client,
      networkIndicator: this.networkIndicator,
      storage: this.storage,
      queries: buildGraphQLCRUDSubscriptions(model),
      model: model
    };
  }
}
