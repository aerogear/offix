import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";
import { NetworkInfo, NetworkStatus, OfflineMutationsHandler, OfflineStore } from "../index";

import { OfflineQueue } from "./OfflineQueue";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../utils/Constants";

import { WebNetworkStatus } from "./network/WebNetworkStatus";
import { OfflineLinkConfig } from "./OfflineLinkConfig";

const logger = debug.default(QUEUE_LOGGER);

/**
 * Apollo link implementation used to queue graphql requests.
 *
 * Link will push every incoming operation to queue.
 * All operations that are ready (i.e. they don't use client
 * generated ID) are forwarded to next link when:
 *
 * - client goes online
 * - there is a new operation and client is online
 * - operation was completed (which could result in ID updates, i.e. new
 *   operations ready to be forwarded - see OfflineQueue class)
 */
export class OfflineLink extends ApolloLink {

  private online: boolean = false;
  private queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;

  constructor(store: OfflineStore, options: OfflineLinkConfig) {
    super();
    if (options.networkStatus) {
      this.networkStatus = options.networkStatus;
    } else {
      this.networkStatus = new WebNetworkStatus();
    }
    this.queue = new OfflineQueue(store, options);
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    // Reattempting operation that was marked as offline
    if (OfflineMutationsHandler.isMarkedOffline(operation)) {
      logger("Enqueueing offline mutation", operation.variables);
      this.queue.persistItemWithQueue(operation).then(() => {
        return this.queue.enqueueOfflineChange(operation, forward);
      });
    }

    // We are online and can skip this link
    return forward(operation);
  }

  /**
   * Force forward offline operations
   */
  public async forwardOfflineOperations() {
    await this.queue.forwardOperations();
  }

  // FIXME This should not be part of the offline link anymore.
  // Offline link should be able to enqueue data but we should be using external queue mechanism
  public async initOnlineState() {
    const queue = this.queue;
    const self = this;
    this.online = !(await this.networkStatus.isOffline());
    if (this.online) {
      queue.forwardOperations();
    }
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
        if (self.online) {
          queue.forwardOperations();
        }
      }
    });
  }

}
