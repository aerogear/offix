
import { IReplicator, IOperation } from "../api/Replicator";
import { CRUDEvents } from "../../storage";
import { PredicateFunction, ModelFieldPredicate, PredicateExpression } from "../../predicates";
import { GraphQLClient } from "../api/GraphQLClient";
import { GraphQLDocuments } from "../api/Documents";

export function convertPredicateToFilter(predicate: PredicateFunction): any {
  if (predicate instanceof ModelFieldPredicate) {
    return {
      [predicate.getKey()]: { [predicate.getOperator().op]: predicate.getValue() }
    };
  }
  const expression: PredicateExpression = predicate as PredicateExpression;
  return {
    [expression.getOperator().op]: expression.getPredicates().map((p) => convertPredicateToFilter(p))
  };
}

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

  public async pullDelta<T>(storeName: string, lastSync: string, predicate?: PredicateFunction) {
    const syncQuery = this.queries.get(storeName)?.queries.sync;
    if (!syncQuery) {
      throw new Error(`GraphQL Sync Queries not found for ${storeName}`);
    }

    const variables: any = { lastSync };
    if (predicate) {
      variables.filter = convertPredicateToFilter(predicate);
    }
    return await this.client.query<T>(syncQuery, variables);
  }

  public subscribe<T>(storeName: string, eventType: CRUDEvents, predicate?: PredicateFunction) {
    const subscriptions = this.queries.get(storeName)?.subscriptions;
    if (!subscriptions) {
      throw new Error(`GraphQL Sync Queries not found for ${storeName}`);
    }

    const variables: any = {};
    if (predicate) {
      variables.filter = convertPredicateToFilter(predicate);
    }

    switch (eventType) {
      case CRUDEvents.ADD:
        return this.client.subscribe<T>(subscriptions.new, variables);
      case CRUDEvents.UPDATE:
        return this.client.subscribe<T>(subscriptions.updated, variables);
      case CRUDEvents.DELETE:
        return this.client.subscribe<T>(subscriptions.deleted, variables);
      default:
        throw new Error("Invalid subscription type received");
    }
  }
}
