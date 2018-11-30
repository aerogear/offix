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
import { Directives } from "../config/Constants";
import { NetworkStatus, NetworkInfo } from "../offline/NetworkStatus";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { squashOperations } from "../offline/squashOperations";

export interface OperationQueueEntry {
  operation: Operation;
  forward: NextLink;
  observer: Observer<FetchResult>;
  subscription?: { unsubscribe: () => void };
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
  private isOpen: boolean = true;
  private storage: PersistentStore<PersistedData>;
  private key: string;
  private networkStatus?: NetworkStatus;
  private operationFilter?: TYPE_MUTATION;

  /**
   *
   * @param config configuration for queue
   * @param filter
   */
  constructor(config: DataSyncConfig, filter?: TYPE_MUTATION) {
    super();
    this.storage = config.storage as PersistentStore<PersistedData>;
    this.key = config.mutationsQueueName;
    this.networkStatus = config.networkStatus;
    this.operationFilter = filter;
  }

  public open() {
    this.isOpen = true;
    this.opQueue.forEach(({ operation, forward, observer }) => {
      forward(operation).subscribe(observer);
    });
    this.opQueue = [];
  }

  public close() {
    this.isOpen = false;
  }

  public request(operation: Operation, forward: NextLink) {
    // TODO split this conditional and add a handler to notify of online only cases
    if (this.isOpen) {
      return forward(operation);
    }
    if (hasDirectives([Directives.ONLINE_ONLY], operation.query)) {
      return forward(operation);
    }

    if (this.shouldSkipOperation(operation, this.operationFilter)) {
      return forward(operation);
    }

    return new Observable(observer => {
      const operationEntry = { operation, forward, observer };
      this.enqueue(operationEntry);
      return () => this.cancelOperation(operationEntry);
    });
  }

  private cancelOperation(entry: OperationQueueEntry) {
    this.opQueue = this.opQueue.filter(e => e !== entry);
    this.storage.setItem(this.key, JSON.stringify(this.opQueue));
  }

  private enqueue(entry: OperationQueueEntry) {
    this.opQueue = squashOperations(entry, this.opQueue);
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
      if (this.networkStatus.isOffline()) {
        this.close();
      } else {
        this.open();
      }
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
}
