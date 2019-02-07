import { OperationQueueEntry } from "./OperationQueueEntry";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { OperationQueue, OperationQueueChangeHandler } from "./OperationQueue";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";
import { squashOperations } from "./squashOperations";

export interface OfflineQueueOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  squashOperations?: boolean;
  listener?: OfflineQueueListener;
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
}

export class OfflineQueue extends OperationQueue {
  private readonly storage?: PersistentStore<PersistedData>;
  private readonly storageKey?: string;
  private readonly listener?: OfflineQueueListener;
  private readonly squashOperations?: boolean;

  constructor(options: OfflineQueueOptions) {
    super(options);

    const { storage, storageKey, listener, squashOperations: squash } = options;

    this.storage = storage;
    this.storageKey = storageKey;
    this.listener = listener;
    this.squashOperations = squash;
  }

  protected enqueueEntry(entry: OperationQueueEntry) {
    if (this.squashOperations) {
      this.queue = squashOperations(entry, this.queue);
    } else {
      this.queue.push(entry);
    }

    this.onEnqueue(entry);

    this.persist();

    if (this.listener && this.listener.onOperationEnqueued) {
      this.listener.onOperationEnqueued(entry);
    }
  }

  protected dequeue(entry: OperationQueueEntry) {
    super.dequeue(entry, false);

    this.updateIds(entry);

    this.persist();

    if (this.queue.length === 0 && this.listener && this.listener.queueCleared) {
      this.listener.queueCleared();
    }

    this.onDequeue(entry);
  }

  private persist() {
    if (this.storage && this.storageKey) {
      this.storage.setItem(this.storageKey, JSON.stringify(this.queue));
    }
  }

  private updateIds(entry: OperationQueueEntry) {
    const { operation: { operationName }, optimisticResponse, result } = entry;
    if (!result || !optimisticResponse || !isClientGeneratedId(optimisticResponse[operationName].id)) {
      return;
    }

    const clientId = optimisticResponse && optimisticResponse[operationName].id;

    this.queue.forEach(({ operation: op }) => {
      if (op.variables.id === clientId) {
        op.variables.id = result.data && result.data[operationName].id;
      }
    });
  }
}
