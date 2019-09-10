import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";
import { NetworkInfo, NetworkStatus, OfflineMutationsHandler, OfflineStore } from "../index";
import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { OfflineQueue } from "./OfflineQueue";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../utils/Constants";
import { OfflineError } from "./OfflineError";
import { IResultProcessor } from "./processors/IResultProcessor";
import { CacheUpdates, createMutationOptions } from "offix-cache";
import { PersistentStore, PersistedData } from "./storage/PersistentStore";
import { WebNetworkStatus } from "./network/WebNetworkStatus";
import { OfflineLinkConfig } from "./OfflineLinkConfig";
import ApolloClient from "offix-cache/node_modules/apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

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
export class OfflineProcessor {

  public online: boolean = false;
  public queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;
  private offlineMutationHandler?: OfflineMutationsHandler;

  constructor(store: OfflineStore, options: OfflineLinkConfig) {
    debugger;
    if (options.networkStatus) {
      this.networkStatus = options.networkStatus;
    } else {
      this.networkStatus = new WebNetworkStatus();
    }
    this.queue = new OfflineQueue(store, options);
  }

  public process(client: ApolloClient<NormalizedCacheObject>, operation: Operation, forward: NextLink): any {
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
      }).catch((error) => {
        logger("Error occurred when persisting item to offline queue", error);
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
    debugger;
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
