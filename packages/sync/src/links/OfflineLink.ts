import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkInfo, NetworkStatus, OfflineQueueListener } from "../offline";
import { OfflineQueue } from "../offline/OfflineQueue";
import { ObjectState } from "../conflicts";
import { isMarkedOffline, markOffline } from "../utils/helpers";

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  listener?: OfflineQueueListener;
  conflictStateProvider?: ObjectState;
}

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
  private queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;
  private online: boolean = false;

  constructor(options: OfflineLinkOptions) {
    super();

    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
  }

  public request(operation: Operation, forward: NextLink) {
    const enqueuedWhenOffline = isMarkedOffline(operation);
    if (enqueuedWhenOffline) {
      // Operation was processed before and needs to be enqueued again
      return this.queue.enqueue(operation, forward);
    }
    if (this.online) {
      // We are online and can skip this link;
      return forward(operation);
    }
    markOffline(operation);
    return this.queue.enqueue(operation, forward);
  }

  public async forwardOnOnline() {
    this.online = !(await this.networkStatus.isOffline());
    const queue = this.queue;
    const self = this;
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
