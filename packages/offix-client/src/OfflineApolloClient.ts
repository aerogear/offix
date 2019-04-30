import {  NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { OfflineStore, OfflineQueueListener } from "./offline";

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
}
