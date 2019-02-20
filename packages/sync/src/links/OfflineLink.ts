import { ApolloLink, Operation, NextLink } from "apollo-link";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OfflineQueueListener, NetworkStatus, NetworkInfo } from "../offline";
import { OfflineQueue } from "../offline/OfflineQueue";
import { isOnlineOnly, isNotSquashable } from "../utils/helpers";

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  squashOperations?: boolean;
  listener?: OfflineQueueListener;
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

    this.handleQueueChange = this.handleQueueChange.bind(this);

    const queueOptions = {
      ...options,
      onEnqueue: this.handleQueueChange,
      onDequeue: this.handleQueueChange
    };

    this.queue = new OfflineQueue(queueOptions);

    this.forwardOnOnline();
  }

  public request(operation: Operation, forward: NextLink) {
    if (isOnlineOnly(operation)) {
      return forward(operation);
    }
    return this.queue.enqueue(operation, forward);
  }

  private handleQueueChange() {
    if (this.online) {
      this.forward();
    }
  }

  private forward() {
    this.queue.toBeForwarded().forEach(operation =>
      operation.forwardOperation()
    );
  }

  private async forwardOnOnline() {
    this.online = !(await this.networkStatus.isOffline());

    const self = this;
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
        if (self.online) {
          self.forward();
        }
      }
    });
  }
}
