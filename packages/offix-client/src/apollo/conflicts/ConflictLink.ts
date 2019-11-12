import { onError, ErrorResponse } from "apollo-link-error";
import { GraphQLError } from "graphql";
import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import {
  ConflictListener,
  ConflictResolutionData,
  ObjectState,
  ConflictResolutionStrategy,
  UseClient,
  ConflictHandler
} from "offix-conflicts-client";
import { isMutation } from "../helpers";

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
 * Conflict handling link implementation that provides ability to determine whether or not a conflict should be handled.
 * Leverages Apollo's onError link to keep track of the observables and the retried operations.
 */
export class ConflictLink extends ApolloLink {
  private stater: ObjectState;
  private link: ApolloLink;
  private strategy: ConflictResolutionStrategy | undefined;
  private listener: ConflictListener | undefined;

  constructor(private config: ConflictConfig) {
    super();
    this.link = onError(this.conflictHandler.bind(this));
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
        return this.link.request(operation, forward);
      }
      return forward(operation);
    }
    return forward(operation);
  }

  // this is a custom onError ErrorHandler. It determines executes the conflictHandler and provides a new operation
  // to work with if necessary.
  private conflictHandler(errorResponse: ErrorResponse): Observable<FetchResult> {
    const { response, operation, forward, graphQLErrors } = errorResponse;
    const data = this.getConflictData(graphQLErrors);
    const individualStrategy = this.strategy || UseClient;
    if (data && operation.getContext().returnType) {
      const base = operation.getContext().conflictBase;
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
      }
    }
    return forward(operation);

  }

  /**
  * Fetch conflict data from the errors returned from the server
  * @param graphQLErrors array of errors to retrieve conflicted data from
  */
  private getConflictData(graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictInfo | undefined {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions && err.extensions.exception && err.extensions.exception.conflictInfo) {
          return err.extensions.exception.conflictInfo;
        }
      }
    }
  }

}
