import { OffixOptions } from "./config/OffixOptions";
import { OffixConfig } from "./config/OffixConfig";

import {
  OfflineStore,
  OfflineQueue,
  IDProcessor,
  OfflineError,
  NetworkStatus,
  NetworkInfo,
  OfflineQueueListener,
  IResultProcessor
} from "offix-offline";

export interface OffixExecutor {
  execute: (options: any) => Promise<any>;
}

/**
 * Offix
 *
 * Offix is a scheduler that queues function calls when
 * an application is considered offline and fulfills them
 * later when the app is back online.
 *
 * The action or function being scheduled can be anything
 * but it is typically reliant on the network and is usually
 * something that causes a server side change
 * e.g. a HTTP Request, Sending a Message, a GraphQL Mutation
 *
 * Offix queues all operations in order and fulfills them when back online.
 * It also persists them, allowing the operations to be kept across app restarts.
 *
 */
export class Offix {

  // the offix client global config
  public config: OffixConfig;
  // The class or object that contains the execute function to be scheduled
  // e.g. a HTTP request, a GraphQL request, etc.
  public executor: OffixExecutor;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the offline storage interface that persists offline data across restarts
  public offlineStore?: OfflineStore<any>;
  // the in memory queue that holds offline data
  public queue: OfflineQueue<any>;
  // listeners that can be added by the user to handle various events coming from the offline queue
  public queueListeners: Array<OfflineQueueListener<any>> = [];

  // determines whether we're offline or not
  private online: boolean = false;

  constructor(options: OffixOptions = {}) {
    this.config = new OffixConfig(options);
    this.networkStatus = this.config.networkStatus;

    // its possible that no storage is available
    if (this.config.offlineStorage) {
      this.offlineStore = new OfflineStore(this.config.offlineStorage, this.config.serializer);
    }

    // TODO we probably need a generic ID processor included by default???
    const resultProcessors: Array<IResultProcessor<any>> = [new IDProcessor()];

    this.executor = this.config.executor;

    this.queue = new OfflineQueue<any>(this.offlineStore, {
      networkStatus: this.networkStatus,
      resultProcessors,
      // TODO this needs to be revisited. What context should the execute function have?
      // Should it be able to access things on the Offix scheduler?
      execute: this.executor.execute.bind(this.executor)
    });
  }

  /**
  * Initialize client
  */
  public async init(): Promise<any> {
    if (this.offlineStore) {
      await this.offlineStore.init();
    }
    await this.restoreOfflineOperations();
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineQueueListener(listener: OfflineQueueListener<any>) {
    this.queue.registerOfflineQueueListener(listener);
  }

  /**
   * Offline wrapper for apollo mutations. Provide Mutation Helper Options and use
   * this offline friendly function to handle the optimistic UI and cache updates.
   *
   * @param options the MutationHelperOptions to create the mutation
   */
  public async execute(options: any): Promise<any> {
    if (this.online) {
      return this.executor.execute(options);
    } else {
      // Queue the operation
      const queueEntry = await this.queue.enqueueOperation(options);

      // build a promise that will resolve/reject when the operation has been fulfilled
      const mutationPromise = this.queue.buildPromiseForEntry(queueEntry);

      // throw an error with a reference to the promise
      throw new OfflineError(mutationPromise as any);
    }
  }

  /**
   * Restore offline operations into the queue
   */
  protected async restoreOfflineOperations() {

    // reschedule offline mutations for new client instance
    await this.queue.restoreOfflineOperations();
    // initialize network status
    await this.initOnlineState();
  }

  protected async initOnlineState() {
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
