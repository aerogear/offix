import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient, MutationOptions, OperationVariables } from "apollo-client";
import { OfflineStore, OfflineQueueListener } from "offix-offline";
import { MutationHelperOptions } from "offix-cache";
import { FetchResult } from "apollo-link";

/**
 * Extension to ApolloClient providing additional capabilities.
 *
 * @see ApolloClient
 */
export interface ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {
  /**
   * Store that can be used to retrieve offline changes
   * Developers can use it to visualize offline changes in their application
   */
  offlineStore: OfflineStore;

  /**
   * Allows to register offline queue listener
   * to listen for various changes in queue
   *
   * @param listener
   */
  registerOfflineEventListener(listener: OfflineQueueListener): void;

  /**
   * Allows the client to perform an offline mutation
   * @param options the mutation helper options used to build the offline mutation
   */
  offlineMutation<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>>;

}
