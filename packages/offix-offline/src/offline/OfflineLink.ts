import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";
import { NetworkInfo, NetworkStatus, OfflineMutationsHandler, OfflineStore } from ".";
import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { OfflineQueue } from "./OfflineQueue";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../utils/Constants";
import { OfflineError } from "./OfflineError";
import { IResultProcessor } from "./processors/IResultProcessor";
import { CacheUpdates } from "offix-cache";
import { PersistentStore, PersistedData } from "./storage/PersistentStore";

const logger = debug.default(QUEUE_LOGGER);

// TODO move to separate file
export interface OfflineLinkConfig {
  networkStatus: NetworkStatus;
  storage: OfflineStore;
  listener?: OfflineQueueListener;
  resultProcessors?: IResultProcessor[];
  mutationCacheUpdates?: CacheUpdates;
  offlineStorage: PersistentStore<PersistedData>;
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

  constructor(options: OfflineLinkConfig) {
    super();
    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    // Reattempting operation that was marked as offline
    if (OfflineMutationsHandler.isMarkedOffline(operation)) {
      logger("Enqueueing offline mutation", operation.variables);
      return this.queue.enqueueOfflineChange(operation, forward);
    }
    if (this.online) {
      logger("Online: Forwarding mutation", operation.variables);
      // We are online and can skip this link
      return forward(operation);
    }

    if (!this.offlineMutationHandler) {
      logger("Error: Offline link setup method was not called");
      return forward(operation);
    }
    const handler = this.offlineMutationHandler;
    return new Observable<FetchResult>(observer => {
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
