import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation
} from "apollo-link";
import { hasDirectives } from "apollo-utilities";
import { Observer } from "zen-observable-ts";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { localDirectives, MUTATION_QUEUE_LOGGER } from "../config/Constants";
import { NetworkInfo, NetworkStatus } from "../offline";
import { DataSyncConfig } from "../config";
import { squashOperations } from "../offline/squashOperations";
import * as debug from "debug";
import { OfflineQueueListener } from "../offline";
import { hasClientGeneratedId } from "../cache/createOptimisticResponse";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

export interface OperationQueueEntry {
  operation: Operation;
  forward: NextLink;
  observer: Observer<FetchResult>;
  subscription?: { unsubscribe: () => void };
  optimisticResponse?: any;
}

/**
 * Type used for filtering
 */
export type TYPE_MUTATION = "mutation" | "query";

/**
 * Apollo link implementation used to queue graphql requests.
 * When queue is open all requests are passing without any operation performed.
 * Closed queue will hold of requests until they are processed and persisting
 * them in supplied storage interface. Queue could open/close
 * depending on network state.
 *
 * @see OfflineQueueLink.openQueueOnNetworkStateUpdates
 */
export class OfflineQueueLink extends ApolloLink {
  private opQueue: OperationQueueEntry[] = [];
  private isOpen: boolean = false;
  private storage: PersistentStore<PersistedData>;
  private readonly key: string;
  private readonly networkStatus?: NetworkStatus;
  private readonly operationFilter?: TYPE_MUTATION;
  private readonly mergeOfflineMutations?: boolean;
  private readonly listener?: OfflineQueueListener;
  /**
   *
   * @param config configuration for queue
   * @param filter
   */
  constructor(config: DataSyncConfig, filter?: TYPE_MUTATION) {
    super();
    this.storage = config.storage as PersistentStore<PersistedData>;
    this.key = config.mutationsQueueName;
    this.mergeOfflineMutations = config.mergeOfflineMutations;
    this.networkStatus = config.networkStatus;
    this.listener = config.offlineQueueListener;
    this.operationFilter = filter;
  }

  public async open() {
    logger("MutationQueue is open", this.opQueue);
    this.isOpen = true;
    for (const opEntry of this.opQueue) {
      let result;
      try {
        result = await this.forwardQueuedOperation(opEntry);
      } catch (error) {
        // TODO: notify about failed operation via OfflineQueueListener
        continue;
      }
      const { operation: { operationName }, optimisticResponse } = opEntry;
      if (result && optimisticResponse && hasClientGeneratedId(optimisticResponse, operationName)) {
        this.updateIds(opEntry, result);
      }
    }
    this.opQueue = [];
    if (this.listener && this.listener.queueCleared) {
      this.listener.queueCleared();
    }
  }

  public close() {
    logger("MutationQueue is closed");
    this.isOpen = false;
  }

  public request(operation: Operation, forward: NextLink) {
    if (this.isOpen) {
      logger("Forwarding request");
      return forward(operation);
    }
    if (hasDirectives([localDirectives.ONLINE_ONLY], operation.query)) {
      logger("Online only request");
      return forward(operation);
    }
    if (this.shouldSkipOperation(operation, this.operationFilter)) {
      return forward(operation);
    }

    return new Observable(observer => {
      const optimisticResponse = operation.getContext().optimisticResponse;
      const operationEntry = { operation, forward, observer, optimisticResponse };
      this.enqueue(operationEntry);
      return () => this.cancelOperation(operationEntry);
    });
  }

  public numberOfOperationsEnqueued() {
    return this.opQueue.length;
  }

  private forwardQueuedOperation(opEntry: OperationQueueEntry): Promise<FetchResult> {
    const { operation, forward, observer } = opEntry;
    return new Promise((resolve, reject) => {
      opEntry.subscription = forward(operation).subscribe({
        next: result => {
          if (observer.next) { observer.next(result); }
          resolve(result);
        },
        error: error => {
          if (observer.error) { observer.error(error); }
          reject(error);
        },
        complete: () => {
          if (observer.complete) { observer.complete(); }
        }
      });
    });
  }

  private cancelOperation(entry: OperationQueueEntry) {
    const subscription = entry.subscription;
    if (subscription) { subscription.unsubscribe(); }
    this.opQueue = this.opQueue.filter(e => e !== entry);
    this.storage.setItem(this.key, JSON.stringify(this.opQueue));
  }

  private enqueue(entry: OperationQueueEntry) {
    logger("Adding new operation to offline queue");
    if (this.listener && this.listener.onOperationEnqueued) {
      this.listener.onOperationEnqueued(entry);
    }
    if (this.mergeOfflineMutations) {
      this.opQueue = squashOperations(entry, this.opQueue);
    } else {
      this.opQueue.push(entry);
    }
    this.storage.setItem(this.key, JSON.stringify(this.opQueue));
  }

  private shouldSkipOperation(operation: Operation, filter?: string) {
    if (!filter) {
      return false;
    }
    return operation.query.definitions.filter((e) => {
      return (e as any).operation === filter;
    }).length === 0;
  }

  /**
   * Turns on queue to react to network state changes.
   * Requires network state implementation to be supplied in the configuration.
   */
  // tslint:disable-next-line:member-ordering
  public openQueueOnNetworkStateUpdates(): void {
    const self = this;
    if (this.networkStatus) {
      this.networkStatus.isOffline().then(offline => {
        if (offline) {
          this.close();
        } else {
          this.open();
        }
      });

      this.networkStatus.onStatusChangeListener({
        onStatusChange(networkInfo: NetworkInfo) {
          if (networkInfo.online) {
            self.open();
          } else {
            self.close();
          }
        }
      });
    }
  }

  /**
   * Allow updates on items created while offline.
   * If item is created while offline and client generated ID is provided
   * to optimisticResponse, later mutations on this item will be using this client
   * generated ID. Once queue is opened and create operation is successful, we should
   * update entries in queue with ID returned from server.
   */
  private updateIds(operationEntry: OperationQueueEntry, result: FetchResult) {
    const { operation: { operationName }, optimisticResponse } = operationEntry;
    const clientId = optimisticResponse && optimisticResponse[operationName].id;

    this.opQueue.forEach(({ operation: op }) => {
      if (op.variables.id === clientId) {
        op.variables.id = result.data && result.data[operationName].id;
      }
    });

    this.storage.setItem(this.key, JSON.stringify(this.opQueue));
  }
}
