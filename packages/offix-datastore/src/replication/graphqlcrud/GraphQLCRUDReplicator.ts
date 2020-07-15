
import { IReplicator, IOperation, } from "../api/Replicator";
import { CRUDEvents } from "../../storage";
import { Predicate } from "../../predicates";
import { GraphQLClient } from "../api/GraphQLClient";
import { GraphQLDocuments } from "../api/Documents";

/**
 * Performs replication using GraphQL
 */
export class GraphQLCRUDReplicator implements IReplicator {
  private client: GraphQLClient;
  private queries: Map<string, GraphQLDocuments>;

  constructor(client: GraphQLClient, queries: Map<string, GraphQLDocuments>) {
    this.client = client;
    this.queries = queries;
  }

  public push<T>(operation: IOperation) {
    const { storeName, input, eventType } = operation;
    const mutations = this.queries.get(storeName)?.mutations;

    if (!mutations) {
      throw new Error(`GraphQL Mutations not found for ${storeName}`);
    }

    switch (eventType) {
      case CRUDEvents.ADD:
        return this.client.mutate<T>(mutations.create, { input });

      case CRUDEvents.UPDATE:
        return this.client.mutate<T>(mutations.update, { input });

      case CRUDEvents.DELETE:
        return this.client.mutate<T>(mutations.delete, { input });

      default:
        throw new Error("Invalid store event received");
    }
  }

  public async pullDelta<T>(storeName: string, lastSync: string, predicate?: Predicate<T>) {
    const syncQuery = this.queries.get(storeName)?.queries.sync;
    if (!syncQuery) {
      throw new Error(`GraphQL Sync Queries not found for ${storeName}`);
    }
    /**
     * TODO convert predicate to filter here.
     * The syncQuery object should do this conversion as it is from the GraphQLCrud Layer
     */
    return await this.client.query<T>(syncQuery, {
      lastSync
    });
  }

  public subscribe<T>(storeName: string, eventType: CRUDEvents, predicate?: Predicate<T>) {
    const subscriptions = this.queries.get(storeName)?.subscriptions;
    if (!subscriptions) {
      throw new Error(`GraphQL Sync Queries not found for ${storeName}`);
    }

    switch (eventType) {
      case CRUDEvents.ADD:
        return this.client.subscribe<T>(subscriptions.new);
      case CRUDEvents.UPDATE:
        return this.client.subscribe<T>(subscriptions.updated);
      case CRUDEvents.DELETE:
        return this.client.subscribe<T>(subscriptions.deleted);
      default:
        throw new Error("Invalid subscription type received");
    }
  }
}
