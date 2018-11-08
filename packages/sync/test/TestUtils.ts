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

export const assertObservableSequence = (
  observable: Observable<ExecutionResult>,
  sequence: ObservableValue[],
  initializer: (sub: Unsubscribable) => void = () => undefined,
): Promise<boolean | Error> => {
  let index = 0;
  if (sequence.length === 0) {
    throw new Error("Observable sequence must have at least one element");
  }
  return new Promise((resolve, reject) => {
    const sub = observable.subscribe({
      next: (value) => {
        expect({ type: "next", value }).eq(sequence[index]);
        index++;
        if (index === sequence.length) {
          resolve(true);
        }
      },
      error: (value) => {
        expect({ type: "error", value }).eq(sequence[index]);
        index++;
        // This check makes sure that there is no next element in
        // the sequence. If there is, it will print a somewhat useful error
        expect(undefined).eq(sequence[index]);
        resolve(true);
      },
      complete: () => {
        expect({ type: "complete" }).eq(sequence[index]);
        index++;
        // This check makes sure that there is no next element in
        // the sequence. If there is, it will print a somewhat useful error
        expect(undefined).eq(sequence[index]);
        resolve(true);
      }
    });
    initializer(sub);
  });
};
