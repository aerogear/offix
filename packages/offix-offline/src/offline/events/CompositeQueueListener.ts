import { ListenerProvider } from "./ListenerProvider";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { FetchResult, Operation } from "apollo-link";
import { OperationQueueEntry } from "../OperationQueueEntry";

/***
 * Wraps multiple listeners allowing them to be
 * registered and unregistered dynamically.
 */
export class CompositeQueueListener implements OfflineQueueListener {

  /**
   * @param listenerProvider instance that contains all registered providers
   */
  constructor(private listenerProvider: ListenerProvider) {
  }

  /**
  * Called when new operation is being added to offline queue
  */
  public onOperationEnqueued(operation: OperationQueueEntry) {
    this.listenerProvider.queueListeners.forEach((listener) => {
      if (listener.onOperationEnqueued) {
        listener.onOperationEnqueued(operation);
      }
    });
  }

  /**
   * Called when back online and operation succeeds
   */
  public onOperationSuccess(operation: Operation, result: FetchResult) {
    this.listenerProvider.queueListeners.forEach((listener) => {
      if (listener.onOperationSuccess) {
        listener.onOperationSuccess(operation, result);
      }
    });
  }

  /**
   * Called when back online and operation fails with GraphQL error
   *
   * graphQLError - application error (it means that user need to react to error and sent this operation again)
   * networkError - operation was retried but it did not reached server (it will be reatempted again)
   */
  public onOperationFailure(operation: Operation, graphQLError?: any, networkError?: any) {
    this.listenerProvider.queueListeners.forEach((listener) => {
      if (listener.onOperationFailure) {
        listener.onOperationFailure(operation, graphQLError, networkError);
      }
    });
  }

  /**
   * Called when offline operation queue is cleared
   */
  public queueCleared() {
    this.listenerProvider.queueListeners.forEach((listener) => {
      if (listener.queueCleared) {
        listener.queueCleared();
      }
    });
  }
}
