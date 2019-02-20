import { OperationQueueEntry } from "./OperationQueueEntry";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { OperationQueue, OperationQueueChangeHandler } from "./OperationQueue";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";
import { squashOperations } from "./squashOperations";
import { isNotSquashable } from "../utils/helpers";

export interface OfflineQueueOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  squashOperations?: boolean;
  listener?: OfflineQueueListener;
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
}

/**
 * Class implementing persistent operation queue.
 *
 * This class is designed to be used by OfflineLink
 * It provides these functionalities:
 *
 * - persisting operation queue in provided storage
 * - squashing incoming operations if enabled
 * - updating client IDs with server IDs (explained below)
 */
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

  /**
   * Returns list of operations that can be forwarded - i.e. they have not
   * been forwarded yet and do not have client ID.
   */
  public toBeForwarded() {
    return this.queue.filter(op => !op.subscription && !op.hasClientId());
  }

  protected enqueueEntry(entry: OperationQueueEntry) {
    if (this.squashOperations && !isNotSquashable(entry.operation)) {
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

  /**
   * Allow updates on items created while offline.
   * If item is created while offline and client generated ID is provided
   * to optimisticResponse, later mutations on this item will be using this client
   * generated ID. Once any create operation is successful, we should
   * update entries in queue with ID returned from server.
   */
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
