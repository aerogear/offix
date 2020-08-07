import { IModelReplicator } from "./api/Replicator";
import { LocalStorage, CRUDEvents } from "../storage";
import { ModelReplicationConfig, MutationsConfig } from "./api/ReplicationConfig";
import { NetworkStatus } from "../network/NetworkStatus";
import { buildGraphQLCRUDMutations } from "./mutations/buildGraphQLCRUDMutations";
import { buildGraphQLCRUDQueries } from ".";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import { Model } from "../Model";
import { Client as URQLClient } from "urql";
import { createLogger } from "../utils/logger";
import { DocumentNode } from "graphql";
import { DeltaReplicator } from "./queries/DeltaReplicator";

const logger = createLogger("modelreplicator");

/**
 * Represents model replication object
 */
export class ModelReplication implements IModelReplicator {
  // TODO model replication interface should based on separate event stream to save data to store
  // rather than operate on the same storage interface as end users
  private storage: LocalStorage;
  private model: Model;
  private client: URQLClient;
  private mutation: any;
  private mutationQueue?: MutationsReplicationQueue;

  constructor(model: Model, storage: LocalStorage, client: URQLClient) {
    this.storage = storage;
    this.model = model;
    this.client = client;
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
