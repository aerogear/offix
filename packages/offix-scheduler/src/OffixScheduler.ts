import { OffixOptions } from "./config/OffixOptions";
import { OffixConfig } from "./config/OffixConfig";

import {
  NetworkStatus,
  NetworkInfo
} from "offix-offline";

import { OffixSchedulerExecutor } from "./OffixSchedulerExecutor";

import { OfflineError } from "./OfflineError";

import {
  OfflineQueue,
  OfflineQueueListener
} from "./queue";

import { OfflineStore } from "./store";

/**
 * OffixScheduler is a scheduler that queues function calls when
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
export class OffixScheduler<T> {

  // the offix client global config
  public config: OffixConfig;
  // The class or object that contains the execute function to be scheduled
  // e.g. a HTTP request, a GraphQL request, etc.
  public executor: OffixSchedulerExecutor;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the offline storage interface that persists offline data across restarts
  public offlineStore: OfflineStore<T>;
  // the in memory queue that holds offline data
  public queue: OfflineQueue<T>;
  // listeners that can be added by the user to handle various events coming from the offline queue
  public queueListeners: Array<OfflineQueueListener<T>> = [];

  // determines whether we're offline or not
  private online: boolean = false;

  constructor(options: OffixOptions = {}) {
    this.config = new OffixConfig(options);
    this.networkStatus = this.config.networkStatus;

    this.offlineStore = new OfflineStore(this.config.offlineStorage, this.config.serializer);

    if (this.config.offlineQueueListener) {
      this.queueListeners.push(this.config.offlineQueueListener);
    }

    this.executor = this.config.executor;

    this.queue = new OfflineQueue<T>(this.offlineStore, {
      listeners: this.queueListeners,
      networkStatus: this.networkStatus,
      // TODO this needs to be revisited. What context should the execute function have?
      // Should it be able to access things on the Offix scheduler?
      execute: this.executor.execute.bind(this.executor)
    });
  }

  /**
  * Initialize the scheduler
  */
  public async init(): Promise<any> {
    try {
      await this.offlineStore.init();
      await this.queue.restoreOfflineOperations();
    } catch(error) {
      console.error("Error initializing storage for offline queue", error);
      console.error("Offline mutations will not be persisted across restarts");
    }
    await this.initOnlineState();
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineQueueListener(listener: OfflineQueueListener<T>) {
    this.queue.registerOfflineQueueListener(listener);
  }

  /**
   * The scheduler execute method. Schedules an operation and its options to be
   * fulfilled when online
   *
   * @param options the options as expected by the Executor
   */
  public async execute(options: T): Promise<any> {
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
