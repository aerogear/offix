import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import { DataSyncConfig } from "../config";
import CacheUpdates from "../cache/CacheUpdates";
import { getMutationName } from "../utils/helpers";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

/**
 * Class used to restore offline queue after page/application restarts.
 * It will trigger saved offline mutations using client to
 * restore all elements in the link.
 */
export class OfflineRestoreHandler {

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private storage: PersistentStore<PersistedData>;
  private readonly storageKey: string;
  private offlineData: OperationQueueEntry[] = [];
  private mutationCacheUpdates?: CacheUpdates;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>, clientConfig: DataSyncConfig) {
    this.apolloClient = apolloClient;
    this.storage = clientConfig.storage as PersistentStore<PersistedData>;
    this.storageKey = clientConfig.mutationsQueueName;
    this.mutationCacheUpdates = clientConfig.mutationCacheUpdates;
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    const stored = await this.getOfflineData();
    if (stored) {
      this.offlineData = JSON.parse(stored.toString());
    } else {
      this.offlineData = [];
    }
    // if there is no offline data  then just exit
    if (!this.hasOfflineData()) { return; }

    // wait before it was cleared
    await this.clearOfflineData();

    logger("Replying offline mutations after application restart");
    this.offlineData.forEach(item => {
      const extensions = item.operation.extensions;
      const optimisticResponse = item.optimisticResponse;
      const mutationName = getMutationName(item.operation.query);
      let updateFunction;
      if (this.mutationCacheUpdates && mutationName) {
        updateFunction = this.mutationCacheUpdates[mutationName];
      }
      const mutationOptions = {
        variables: item.operation.variables,
        mutation: item.operation.query,
        // Restore optimistic response from operation in order to see it
        optimisticResponse,
        update: updateFunction,
        // Pass extensions as part of the context
        context: { extensions }
      };
      this.apolloClient.mutate(mutationOptions);
    });

    this.offlineData = [];
  }

  private getOfflineData = async () => {
    return this.storage.getItem(this.storageKey);
  }

  private hasOfflineData() {
    return (this.offlineData && this.offlineData.length > 0);
  }

  private clearOfflineData = async () => {
    return this.storage.removeItem(this.storageKey);
  }
}
