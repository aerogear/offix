import { FetchResult, NextLink, Operation } from "apollo-link";
import { isClientGeneratedId, generateId } from "../cache/createOptimisticResponse";

/**
 * Represents data that is being saved to the offlien store
 */
export interface OfflineItem {
  operation: Operation;
  optimisticResponse?: any;
  id: string;
}

/**
 * Class representing operation queue entry.
 *
 * It exposes method for forwarding the operation.
 */
export class OperationQueueEntry implements OfflineItem {

  public readonly operation: Operation;
  public readonly optimisticResponse?: any;
  public id: string;
  public forward?: NextLink;
  public result?: FetchResult;
  public networkError: any;
  public observer?: ZenObservable.SubscriptionObserver<FetchResult>;

  constructor(operation: Operation, offlineId?: number, forward?: NextLink) {
    this.operation = operation;
    this.forward = forward;
    if (offlineId) {
      this.id = offlineId.toString();
    } else {
      this.id = generateId();
    }
    if (typeof operation.getContext === "function") {
      this.optimisticResponse = operation.getContext().optimisticResponse;
    }
  }

  /**
   * Checks if offline operation contains client id or server side id.
   * For new items made when offline changes will always have client side id.
   */
  public hasClientId() {
    return isClientGeneratedId(this.operation.variables.id);
  }

  /**
   * Adapt object in order to persist required information
   */
  public toOfflineItem(): OfflineItem {
    return {
      operation: this.operation,
      optimisticResponse: this.optimisticResponse,
      id: this.id
    };
  }
}
