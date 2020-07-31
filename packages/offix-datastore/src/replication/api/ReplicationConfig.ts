
import { GraphQLClientConfig } from "./GraphQLClient";
import { NetworkStatus } from "../../network/NetworkStatus";
import { Predicate } from "../../predicates";
import { MutationRequest } from "../mutations/MutationRequest";

/**
 * Configuration options for Delta Queries replication
 */
export interface DeltaQueriesConfig {
  enabled: boolean;
  pullInterval?: number;
  forceOnReconnect?: boolean;
  forceOnReconnectDelay?: number;
  queryLimit?: number;
}

/**
 * Configuration options for Subscription replication
 */
export interface LiveUpdatesConfig {
  enabled: boolean;
  forceReconnect?: boolean;
  forceOnReconnectDelay?: number;
}

/**
 * Handle errors repeat request if needed
 *
 * @returns MutationRequest if request should be repeated
 */
export type UserErrorHandler = (networkError: any, graphqlError: any) => MutationRequest | undefined;

/**
 * Allows to update queue operations. Returns new updated queue that should be persisted
 */
export type ResultProcessor = (result: any, queue: MutationRequest[]) => MutationRequest[];

/**
 * Configuration options for mutations (edits) replication
 */
export interface MutationsConfig {
  enabled: boolean;

  /**
   * Allow users to specify error handler that will check error type and repeat operations
   */
  errorHandler?: UserErrorHandler

  /**
   * Allows to update queue operations. Returns new updated queue that should be persisted
   */
  resultProcessor?: ResultProcessor

  /**
   * Updates fetch options for particular model
   */
  fetchOptions?: RequestInit | (() => RequestInit);
}


/**
 * Default configuration for the replication engine that can be supplied globally
 * or per specific dataset.
 */
export interface GlobalReplicationConfig {
  /**
   * URQL client specific configuration used to replication
   */
  client: GraphQLClientConfig;

  /**
   * Configuration for fetching delta changes from server
   */
  delta?: DeltaQueriesConfig;

  /**
   * Configuration for replicating mutations (edits) back to the server
   */
  mutations?: MutationsConfig;

  /**
   * Configuration for live updates based on subscriptions
   */
  liveupdates?: LiveUpdatesConfig;

  /**
   * Provides network status interface.
   * By default platform will assume that deal with web interfaces.
   * If you use react native you should override that with React Native specific interfaces.
   */
  networkStatus?: NetworkStatus;
}

/**
 * Extension to global query configuration
 */
export interface ModelPredicateQuery {
  /**
   * Predicate that will be be transformed to remote GraphQL query
   */
  // TODO remove unneded generics
  predicate?: Predicate<any>
}

/**
 * Model specific configuration for replication
 */

export interface ModelReplicationConfig {
  // TODO add ability to change url for replication
  delta?: DeltaQueriesConfig & ModelPredicateQuery;
  liveupdates?: LiveUpdatesConfig & ModelPredicateQuery;
  mutations?: MutationsConfig;
}

