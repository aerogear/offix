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
import { DataSyncConfig } from "../config/DataSyncConfig";
import { NetworkStatus, NetworkInfo } from "../offline/NetworkStatus";
import { squashOperations } from "../offline/squashOperations";

export interface OperationQueueEntry {
  operation: Operation;
  forward: NextLink;
  observer: Observer<FetchResult>;
  subscription?: { unsubscribe: () => void };
}

export default class QueueLink extends ApolloLink {
  private opQueue: OperationQueueEntry[] = [];
  private isOpen: boolean = true;
  private storage: PersistentStore<PersistedData>;
  private key: string;
  private networkStatus?: NetworkStatus;

  constructor(config: DataSyncConfig) {
    super();
    this.storage = config.storage as PersistentStore<PersistedData>;
    this.key = config.mutationsQueueName;
    this.networkStatus = config.networkStatus;
    this.setNetworkStateHandlers();
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
    if (this.isOpen || hasDirectives([Directives.ONLINE_ONLY, Directives.NO_SQUASH], operation.query)) {
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

  private setNetworkStateHandlers(): void {
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
