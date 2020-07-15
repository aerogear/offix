
import { IReplicator, IOperation } from "../api/Replicator";
import { CRUDEvents } from "../../storage";
import { PredicateFunction, ModelFieldPredicate, PredicateExpression } from "../../predicates";
import { GraphQLDocuments } from "../api/Documents";
import { DocumentNode } from "graphql";
import { Client } from "urql";
import Observable from "zen-observable";
import { pipe, subscribe } from "wonka";

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
  private client: Client;
  private queries: Map<string, GraphQLDocuments>;

  constructor(client: Client, queries: Map<string, GraphQLDocuments>) {
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
        return this.mutate<T>(mutations.create, { input });

      case CRUDEvents.UPDATE:
        return this.mutate<T>(mutations.update, { input });

      case CRUDEvents.DELETE:
        return this.mutate<T>(mutations.delete, { input });

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
    return await this.query<T>(syncQuery, variables);
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
        return this.observe<T>(subscriptions.new, variables);
      case CRUDEvents.UPDATE:
        return this.observe<T>(subscriptions.updated, variables);
      case CRUDEvents.DELETE:
        return this.observe<T>(subscriptions.deleted, variables);
      default:
        throw new Error("Invalid subscription type received");
    }
  }

  async query<T>(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.query(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  async mutate<T>(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.mutation(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  public observe<T>(query: string | DocumentNode, variables?: any) {
    return new Observable<T>(observer => {
      pipe(
        this.client.subscription(query, variables),
        subscribe(result => {
          if (result.error) {
            observer.error(result.error);
          }
          if (result?.data) {
            observer.next(result.data);
          }
        })
      );
    });
  }
}
