import { FetchResult, NextLink, Operation, DocumentNode } from "apollo-link";
import { isClientGeneratedId, generateClientId } from "offix-cache";

/**
 * Represents data that is being saved to the offline store
 */
export interface OfflineItem {
  query: DocumentNode;
  variables: Record<string, any>;
  operationName: string;
  id: string;
  conflictBase?: any;
  returnType?: string;
  idField?: string;
  optimisticResponse?: any;
  conflictStrategy?: string;
}

/**
 * Class representing operation queue entry.
 *
 * It exposes method for forwarding the operation.
 */
export class OperationQueueEntry implements OfflineItem {
  public readonly query: DocumentNode;
  public readonly variables: Record<string, any>;
  public readonly operationName: string;
  public readonly optimisticResponse?: any;
  public readonly id: string;
  public readonly idField?: string = "id";
  public readonly returnType?: string;
  public readonly conflictBase: any;
  public conflictStrategy?: string;

  public onComplete?: Function
  public onError?: Function

  public result?: FetchResult;
  public networkError: any;
  public observer?: ZenObservable.SubscriptionObserver<FetchResult>;

  constructor(operation: Operation, offlineId?: number) {
    this.query = operation.query;
    this.variables = operation.variables;
    this.operationName = operation.operationName;
    if (offlineId) {
      this.id = offlineId.toString();
    } else {
      this.id = generateClientId();
    }
    if (typeof operation.getContext === "function") {
      const context = operation.getContext();
      this.conflictBase = context.conflictBase;
      this.returnType = context.returnType;
      this.idField = context.idField;
      this.optimisticResponse = context.optimisticResponse;
      if (context.conflictStrategy) {
        this.conflictStrategy = context.conflictStrategy.id;
      }
    }
  }

  /**
   * Checks if offline operation contains client id or server side id.
   * For new items made when offline changes will always have client side id.
   */
  public hasClientId() {
    return isClientGeneratedId(this.variables[this.idField as string]);
  }

  /**
   * Adapt object in order to persist required information
   */
  public toOfflineItem(): OfflineItem {
    return {
      query: this.query,
      variables: this.variables,
      operationName: this.operationName,
      optimisticResponse: this.optimisticResponse,
      id: this.id,
      idField: this.idField,
      returnType: this.returnType,
      conflictBase: this.conflictBase,
      conflictStrategy: this.conflictStrategy
    };
  }
}
