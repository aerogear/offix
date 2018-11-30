import {
  Operation, NextLink
} from "apollo-link";
import { squashOperations } from "../src/offline/squashOperations";
import { OfflineQueueLink as QueueLink, OperationQueueEntry } from "../src/links/OfflineQueueLink";
import { expect } from "chai";

import { op, opWithDirective, opWithDifferentQuery } from "./operations";

const queueEntry: OperationQueueEntry = {
  operation: op,
  forward: {} as any,
  observer: {} as any
};

const queueEntryDifferentID: OperationQueueEntry = {
  operation: {
    ...op, variables: {
      name: "User 1",
      id: 44,
      dateOfBirth: "1/1/18",
      address: "GraphQL Lane",
      version: 1
    }
  },
  forward: {} as any,
  observer: {} as any
};

const queueEntryNewVars: OperationQueueEntry = {
  operation: {
    ...op, variables: {
      name: "User 1",
      id: 5,
      dateOfBirth: "12/12/18",
      address: "GraphQL Lane",
      version: 1
    }
  },
  forward: {} as any,
  observer: {} as any
};

const queueEntryDifferentQuery: OperationQueueEntry = {
  operation: opWithDifferentQuery,
  forward: {} as any,
  observer: {} as any
};

describe("SquashOperations", () => {
  let opQueue: OperationQueueEntry[] = [];
  beforeEach(() => {
    opQueue = [];
  });

  it("check queue contains single operation", () => {
    const queue = squashOperations(queueEntry, opQueue);
    expect(queue.length).eqls(1);
  });

  it("check queue contains two operations when ID differs", () => {
    opQueue = squashOperations(queueEntry, opQueue);
    opQueue = squashOperations(queueEntryDifferentID, opQueue);
    expect(opQueue.length).eqls(2);
  });

  it("check queue contains one operation when ID is the same", () => {
    opQueue = squashOperations(queueEntry, opQueue);
    opQueue = squashOperations(queueEntry, opQueue);
    expect(opQueue.length).eqls(1);
    opQueue = squashOperations(queueEntry, opQueue);
    expect(opQueue.length).eqls(1);
  });

  it("check vars are over ridden", () => {
    opQueue = squashOperations(queueEntry, opQueue);
    opQueue = squashOperations(queueEntryNewVars, opQueue);
    expect(opQueue.length).eqls(1);
    expect(opQueue[0].operation.variables).eqls(queueEntryNewVars.operation.variables);
  });

  it("check queue contains two operations when query name differs", () => {
    opQueue = squashOperations(queueEntry, opQueue);
    opQueue = squashOperations(queueEntryDifferentQuery, opQueue);
    expect(opQueue.length).eqls(2);
  });

  it("check queue contains three operations", () => {
    opQueue = squashOperations(queueEntry, opQueue);
    opQueue = squashOperations(queueEntryDifferentQuery, opQueue);
    opQueue = squashOperations(queueEntryDifferentID, opQueue);
    expect(opQueue.length).eqls(3);
    opQueue = squashOperations(queueEntryDifferentID, opQueue);
    expect(opQueue.length).eqls(3);

  });

  it("test noSquash Directive", () => {
    let operations: any[] = [];
    const storageEngine = {
      getItem() {
        return operations;
      },
      removeItem() {
        operations = [];
      },
      setItem(key: string, content: any) {
        operations = JSON.parse(content);
      }
    };
    const localConfig = { mutationsQueueName: "test", storage: storageEngine };
    const queueLink = new QueueLink(localConfig);
    queueLink.close();
    queueLink.request(opWithDirective, {} as NextLink).subscribe({});
    queueLink.request(opWithDirective, {} as NextLink).subscribe({});
    expect(localConfig.storage.getItem().length).eqls(2);
  });
});
