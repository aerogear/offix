import { DocumentNode } from "graphql";

import { IReplicator, IOperation, IReplicationResponse } from "./Replicator";
import { Model } from "../Model";
import { DatabaseEvents } from "../storage";
import { Predicate } from "../predicates";

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorMutations {
    /**
     * GraphQL create mutation document.
     * It takes an input variable which is the entity to be created
     */
    create: string | DocumentNode;

    /**
     * GraphQL update mutation document.
     * It takes an input variable which contains the
     * update to be made and the id of the entity to be updated
     */
    update: string | DocumentNode;

    /**
     * GraphQL delete mutation document.
     * It takes an input variable which contains
     * fields that match the entity to be deleted
     */
    delete: string | DocumentNode;
}

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorSubscriptions {
  /**
   * GraphQL create subscription document.
   */
  new: string | DocumentNode;

  /**
   * GraphQL update subscription document.
   */
  updated: string | DocumentNode;

  /**
   * GraphQL delete subscription document.
   */
  deleted: string | DocumentNode;
}

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorQueries {
  /**
   * FindQuery used to fetch data
   */
  find: string | DocumentNode;

  /**
   * GraphQL get operation
   */
  get: string | DocumentNode;
}

export interface GraphQLQueries {
    queries: ReplicatorQueries;
    mutations: ReplicatorMutations;
    subscriptions: ReplicatorSubscriptions;
}
/**
 * A GraphQLClient to communicate with the GraphQLAPI
 * e.g. Urql, Apollo etc.
 */
export interface GraphQLClient {
    /**
     * mutates a graphql query to the server
     * @param query
     * @param variables
     */
    mutate(query: string | DocumentNode, variables?: any): Promise<IReplicationResponse>;
}

/**
 * The GraphQLQueryBuilder is responsible for building GraphQLQueries
 */
export interface GraphQLQueryBuilder {
    /**
     * @returns a map of model store names to their GraphQLQueries
     */
    build(models: Model<unknown>[]): Map<string, GraphQLQueries>;
}

/**
 * Performs replication using GraphQL
 */
export class GraphQLReplicator implements IReplicator {
    private client: GraphQLClient;
    private queries: Map<string, GraphQLQueries>;

    constructor(client: GraphQLClient, queries: Map<string, GraphQLQueries>) {
        this.client = client;
        this.queries = queries;
    }

    public push(operation: IOperation) {
        const { storeName, input, eventType } = operation;
        const mutations = this.queries.get(storeName)?.mutations;

        if (!mutations) {
            throw new Error(`GraphQL Mutations not found for ${storeName}`);
        }

        switch (eventType) {
            case DatabaseEvents.ADD:
                return this.client.mutate(mutations.create, { input });

            case DatabaseEvents.UPDATE:
                return this.client.mutate(mutations.update, { input });

            case DatabaseEvents.DELETE:
                return this.client.mutate(mutations.delete, { input });

            default:
                throw new Error("Invalid store event received");
        }
    }

    public async pullDelta<T>(modelName: string, lastSync: string, predicate?: Predicate<T>) {
        return [{}] as T[];
    }
}
