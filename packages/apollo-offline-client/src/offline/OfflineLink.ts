import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { NetworkInfo, NetworkStatus, OfflineQueueListener, OfflineMutationsHandler, OfflineStore } from ".";
import { OfflineQueue } from "./OfflineQueue";
import { ObjectState } from "../conflicts";
import { OperationQueueEntry } from "./OperationQueueEntry";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../config/Constants";
import { OfflineError } from "./OfflineError";

export const logger = debug.default(QUEUE_LOGGER);

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  store: OfflineStore;
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

  private online: boolean = false;
  private queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;
  private offlineMutationHandler?: OfflineMutationsHandler;

  constructor(options: OfflineLinkOptions) {
    super();
    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
  }

  public request(operation: Operation, forward: NextLink) {
    // Reattempting operation that was marked as offline
    if (OfflineMutationsHandler.isMarkedOffline(operation)) {
      logger("Enqueueing offline mutation", operation.variables);
      return this.queue.enqueueOfflineChange(operation, forward);
    }

    if (this.online) {
      logger("Online: Forwarding mutation", operation.variables);
      // We are online and can skip this link;
      return forward(operation);
    }

    if (!this.offlineMutationHandler) {
      logger("Error: Offline link setup method was not called");
      return forward(operation);
    }
    const handler = this.offlineMutationHandler;
    return new Observable(observer => {
      this.queue.persistItemWithQueue(operation).then((operationEntry) => {
        // Send mutation request again
        const offlineMutation = handler.mutateOfflineElement(operationEntry);
        logger("Returning offline error to client", operation.variables);
        observer.error(new OfflineError(offlineMutation));
      });
      return () => { return; };
    });
  }

  /**
   * Force forward offline operations
   */
  public async forwardOfflineOperations() {
    await this.queue.forwardOperations();
  }

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

  public setup(handler: OfflineMutationsHandler) {
    this.offlineMutationHandler = handler;
  }
}
