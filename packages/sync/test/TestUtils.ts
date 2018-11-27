import {
  ApolloLink,
  Observable,
  Operation
} from "apollo-link";
import {
  ExecutionResult
} from "graphql";

import { expect } from "chai";

export class TestLink extends ApolloLink {
  public operations: Operation[];
  constructor() {
    super();
    this.operations = [];
  }

  public request(operation: Operation) {
    this.operations.push(operation);
    return new Observable(observer => {
      if (operation.getContext().testError) {
        setTimeout(() => observer.error(operation.getContext().testError), 0);
        return;
      }
      setTimeout(() => observer.next(operation.getContext().testResponse), 0);
      setTimeout(() => observer.complete(), 0);
    });
  }
}

export interface ObservableValue {
  value?: ExecutionResult | Error;
  delay?: number;
  type: "next" | "error" | "complete";
}

export interface Unsubscribable {
  unsubscribe: () => void;
}
