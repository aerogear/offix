
import { IReplicator } from "./api/Replicator";
import { LocalStorage, CRUDEvents } from "../storage";
import { Model } from "../Model";
import { WebNetworkStatus } from "../network/WebNetworkStatus";
import { NetworkIndicator } from "../network/NetworkIndicator";
import { GlobalReplicationConfig, ModelReplicationConfig, MutationsConfig } from "./api/ReplicationConfig";
import { createGraphQLClient } from "./utils/createGraphQLClient";
import { Client } from "urql";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import { NetworkStatus } from "../network/NetworkStatus";
import { buildGraphQLCRUDQueries } from ".";
import { DeltaReplicator } from "./queries/DeltaReplicator";
import { buildGraphQLCRUDMutations } from "./mutations/buildGraphQLCRUDMutations";
import { DocumentNode } from "graphql";

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
export class GraphQLCRUDReplicator implements IReplicator {
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

  public startModelReplication(model: Model, storage: LocalStorage, replicationConfig?: ModelReplicationConfig) {
    let config: ModelReplicationConfig = this.config;
    if (replicationConfig) {
      config = Object.assign({}, this.config, replicationConfig);
    }

    // Replication on model level gives more refined control how individual
    // models are replicate and allows developers to directly control it.
    const modelReplication = new ModelReplication(model, storage, this.client);
    modelReplication.init(config, this.networkStatus);
    model.setReplicator(modelReplication);
  }

  public init(config: ModelReplicationConfig, networkInterface: NetworkStatus): void {
    if (config.mutations?.enabled) {
      this.createMutationsReplication(networkInterface, config.mutations);
    }

    if (config.delta?.enabled) {
      const queries = buildGraphQLCRUDQueries(this.model);
      const deltaOptions = {
        config: config.delta,
        client: this.client,
        networkInterface,
        storage: this.storage,
        query: queries.sync,
        model: this.model
      };
      const replicator = new DeltaReplicator(deltaOptions);
      replicator.start();
    }

    if (config.liveupdates?.enabled) {
      // const subscriptionQueries = buildGraphQLCRUDSubscriptions(this.model);
      // TODOs
    }
  }

  public forceDeltaQuery<T>(): Promise<void> {
    //TODO
    return Promise.resolve();
  }

  public resetReplication<T>(config: ModelReplicationConfig): void {
    // TODO
  }

  public async replicate(data: any, eventType: CRUDEvents) {
    if (!this.mutationQueue) {
      return;
    }

    // Actual graphql queries need to be persisted at the time of request creation
    // This will ensure consistency for situations when model changed (without migrating queue)
    let mutationRequest;
    const storeName = this.model.getStoreName();
    if (CRUDEvents.ADD === eventType) {
      mutationRequest = this.createMutationRequest(this.mutation.create, data, storeName, eventType);
    }
    else if (CRUDEvents.UPDATE === eventType) {
      mutationRequest = this.createMutationRequest(this.mutation.update, data, storeName, eventType);
    }
    else if (CRUDEvents.DELETE === eventType) {
      mutationRequest = this.createMutationRequest(this.mutation.delete, data, storeName, eventType);
    } else {
      logger("Invalid store event received");
      throw new Error("Invalid store event received");
    }

    // Adding request to queue.
    // Queue deals with: persistence, processing, offline, error handling, id mapping
    // TODO await the completion of this request
    this.mutationQueue.addMutationRequest(mutationRequest);
  }

  private createMutationsReplication(networkStatus: NetworkStatus, config: MutationsConfig) {
    // TODO maybe we want this functions to be injected and replaced
    // Later consideration how replication engine is build
    this.mutation = buildGraphQLCRUDMutations(this.model);
    this.mutationQueue = new MutationsReplicationQueue({
      storage: this.storage,
      client: this.client,
      networkStatus: networkStatus,
      errorHandler: config.errorHandler,
      resultProcessor: config.resultProcessor,
      model: this.model
    });
    this.mutationQueue.init().then(() => {
      this.mutationQueue?.process();
    });
  }

  // TODO extract to simplify overriding replication
  private createMutationRequest(mutation: DocumentNode, data: any, storeName: string, eventType: CRUDEvents) {
    return {
      mutation,
      // TODO transform this to generic values
      variables: { input: data },
      storeName,
      version: 1,
      eventType
    };
  }
}
