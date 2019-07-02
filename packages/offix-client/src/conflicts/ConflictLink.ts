import { onError, ErrorResponse } from "apollo-link-error";
import { GraphQLError, ExecutionResult, subscribe } from "graphql";
import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { isMutation } from "../utils/helpers";
import { ObjectState, ConflictListener } from ".";
import { ConflictResolutionStrategy } from "./strategies/ConflictResolutionStrategy";
import { clientWins } from "./strategies/strategies";
import { ConflictHandler } from "./handler/ConflictHandler";

/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 */
export class LocalConflictError extends Error {
  constructor(private base: any, private variables: any) {
    super();
  }
}

/**
 * Represents conflict information that was returned from server
 */
export interface ConflictInfo {
  serverState: ConflictResolutionData;
  clientState: ConflictResolutionData;
  // Expected return type of the mutation
  returnType: string;
}

/**
 * Configuration for conflict resolution
 */
export interface ConflictConfig {
  /**
   * Interface that defines how object state is progressed
   * This interface needs to match state provider supplied on server.
   */
  conflictProvider: ObjectState;

  /**
   * Interface that can be implemented to receive information about the data conflict
   *
   * @deprecated see OfflineClient.registerOfflineEventListener
   */
  conflictListener?: ConflictListener;

  /**
   * The conflict resolution strategy your client should use. By default it takes client version.
   */
  conflictStrategy?: ConflictResolutionStrategy;
}

/**
 * Conflict handling link implementation that provides ability to determine
 */
export class ConflictLink extends ApolloLink {
  private stater: ObjectState;
  private strategy: ConflictResolutionStrategy | undefined;
  private listener: ConflictListener | undefined;

  constructor(private config: ConflictConfig) {
    super();
    this.stater = this.config.conflictProvider;
    this.strategy = this.config.conflictStrategy;
    this.listener = this.config.conflictListener;
  }

  public request(
    operation: Operation,
    forward: NextLink
  ): Observable<FetchResult> | null {
    if (isMutation(operation)) {
      if (this.stater.currentState(operation.variables) !== undefined) {
        return new Observable(observer => {
          let retriedResult: any;
          let sub: any;
          let retriedSub: any;
          sub = forward(operation).subscribe({
            next: (result: FetchResult) => {
              retriedResult = this.conflictHandler({
                response: result,
                operation,
                forward,
                graphQLErrors: result.errors
              });

              if (retriedResult) {
                retriedSub = retriedResult.subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer)
                });
                return;
              }
              observer.next(result);
            },
            error: networkError => {
              retriedResult = this.conflictHandler({
                operation,
                networkError,
                graphQLErrors:
                  networkError &&
                  networkError.result &&
                  networkError.result.errors,
                forward
              });
              if (retriedResult) {
                retriedSub = retriedResult.subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer)
                });
                return;
              }
              observer.error(networkError);
            },
            complete: () => {
              if (!retriedResult) {
                observer.complete.bind(observer)();
              }
            }
          });
          return () => {
            if (sub) {
              sub.unsubscribe();
            }
            if (retriedSub) {
              retriedSub.unsubscribe();
            }
          };
        });
      }
    }
    return forward(operation);
  }

  private conflictHandler(errorResponse: ErrorResponse) {
    const { response, operation, forward, graphQLErrors } = errorResponse;
    const data = this.getConflictData(graphQLErrors);
    const individualStrategy = this.strategy || clientWins;
    if (data && operation.getContext().returnType) {
      const base = operation.getContext().base;
      const conflictHandler = new ConflictHandler({
        base,
        client: data.clientState,
        server: data.serverState,
        strategy: individualStrategy,
        listener: this.listener,
        objectState: this.config.conflictProvider as ObjectState,
        operationName: operation.operationName
      });
      const resolvedConflict = conflictHandler.executeStrategy();
      if (resolvedConflict) {
        operation.variables = resolvedConflict;
        return forward(operation);
      }

    }
  }

  /**
  * Fetch conflict data from the errors returned from the server
  * @param graphQLErrors array of errors to retrieve conflicted data from
  */
  private getConflictData(graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictInfo | undefined {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions) {
          if (err.extensions.exception.conflictInfo) {
            return err.extensions.exception.conflictInfo;
          }
        }
      }
    }
  }

}
