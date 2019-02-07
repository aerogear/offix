import { Operation, FetchResult } from "apollo-link";
import { OperationQueueEntry } from "./OperationQueueEntry";

/**
 * Interface for creating listeners for offline queue.
 * Offline queue will add elements to queue when it's closed.
 * This listener can be supplied to detect this events.
 */
export interface OfflineQueueListener {

  /**
   * Called when new operation is being added to offline queue
   */
  onOperationEnqueued?: (operation: OperationQueueEntry) => void;

  /**
   * Called when back online and operation succeeds
   */
  onOperationSuccess?: (operation: Operation, result: FetchResult) => void;

  /**
   * Called when back online and operation fails with GraphQL error
   */
  onOperationFailure?: (operation: Operation, error: any) => void;

  /**
   * Called when offline operation queue is cleared
   */
  queueCleared?: () => void;
}
