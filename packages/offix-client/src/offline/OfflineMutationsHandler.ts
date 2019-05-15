import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { OfflineItem } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import { DataSyncConfig } from "../config";
import { CacheUpdates } from "../cache/CacheUpdates";
import { getMutationName } from "../utils/helpers";
import { Operation } from "apollo-link";
import { OfflineStore } from "./storage/OfflineStore";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

/**
 * Class used to send offline changes again after error is sent to user or after application restart.
 * It will trigger saved offline mutations using client to restore all elements in the link.
 */
// TODO rename
export class OfflineMutationsHandler {

  private mutationCacheUpdates?: CacheUpdates;

  constructor(private store: OfflineStore,
              private apolloClient: ApolloClient<NormalizedCacheObject>,
              clientConfig: DataSyncConfig) {
    this.mutationCacheUpdates = clientConfig.mutationCacheUpdates;
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    const offlineData = await this.store.getOfflineData();
    // if there is no offline data  then just exit
    if (offlineData && offlineData.length === 0) { return; }

    logger("Replying offline mutations after application restart");
    for (const item of offlineData) {
      this.mutateOfflineElement(item);
    }
  }

  /**
   * Perform mutation using client replicating parameters that user provided into
   *
   * @param item
   */
  public async mutateOfflineElement(item: OfflineItem) {
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
      // Pass client update functions
      update: updateFunction,
      // Pass extensions as part of the context
      context: this.getOfflineContext(item.id)
    };
    await this.apolloClient.mutate(mutationOptions);
  }

  /**
   * Add info to operation that was done when offline
   */
  public getOfflineContext(id: string) {
    return { isOffline: true, offlineId: id };
  }

  /**
   * Checks if operation was scheduled to saved to offline queue.
   * This operations have special handling.
   * They are never forwarded when sent back again to client.
   */
  // tslint:disable-next-line:member-ordering
  public static isMarkedOffline(operation: Operation) {
    return !!operation.getContext().isOffline;
  }
}
