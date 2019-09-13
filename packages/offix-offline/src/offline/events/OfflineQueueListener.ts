import { QueueEntryOperation } from "../OfflineQueue";

/**
 * Interface for creating listeners for offline queue.
 * Offline queue will add elements to queue when it's closed.
 * This listener can be supplied to detect this events.
 */
export interface OfflineQueueListener {

  /**
   * Called when new operation is being added to offline queue
   */
  onOperationEnqueued?: (op: QueueEntryOperation) => void;

  /**
   * Called when back online and operation succeeds
   */
  onOperationSuccess?: (op: QueueEntryOperation, result: any) => void;

  /**
   * Called when back online and operation fails with GraphQL error
   *
   * graphQLError - application error (it means that user need to react to error and sent this operation again)
   * networkError - operation was retried but it did not reached server (it will be reatempted again)
   */
  // onOperationFailure?: (op: MutationOptions, graphQLError?: any, networkError?: any) => void;v

  // TODO - Support both error types described above but in a more generic way
  onOperationFailure?: (op: QueueEntryOperation, error: Error) => void;

  /**
   * Called when offline operation queue is cleared
   */
  queueCleared?: () => void;
}
