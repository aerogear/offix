// tslint:disable-next-line:ordered-imports
/// <reference types="@types/mocha" />
import {
  ApolloLink, execute, GraphQLRequest, Operation, NextLink
} from "apollo-link";
import gql from "graphql-tag";
import { OfflineQueueLink as QueueLink } from "../src/links/OfflineQueueLink";
import {
  TestLink
} from "./TestUtils";

import { expect } from "chai";
import { PersistentStore, PersistedData } from "../src/PersistentStore";

const localStorage: PersistentStore<PersistedData> = {
  getItem: (key: string) => {
    return {};
  },
  setItem: (key: string, data: PersistedData) => {
    console.info("save data", data);
  },
  removeItem: (key: string) => {
    console.info("remove data", key);
  }
};

describe("OnOffLink", () => {
  let link: ApolloLink;
  let onOffLink: QueueLink;
  let testLink: TestLink;

  const testResponse = {
    data: {
      hello: "World"
    }
  };

  const op: GraphQLRequest = {
    query: gql`{ hello }`,
    context: {
      testResponse
    }
  };

  const opDirective: Operation = {
    variables: {
      name: "User 1",
      dateOfBirth: "Fri Nov 30 2018 09:43:22 GMT+0000",
      id: "1",
      version: 3
    },
    operationName: "updateUser",
    query: {
      kind: "Document",
      definitions: [{
        kind: "OperationDefinition",
        operation: "mutation",
        name: {
          kind: "Name",
          value: "updateUser"
        },
        selectionSet: {
          kind: "SelectionSet",
          selections: [{
            kind: "Field",
            name: {
              kind: "Name",
              value: "updateUser"
            },
            directives: [{
              kind: "Directive",
              name: {
                kind: "Name",
                value: "noSquash"
              },
              arguments: []
            }]
          }]
        }
      }]
    },
    extensions: {} as any,
    setContext: {} as any,
    getContext: {} as any,
    toKey: {} as any
  };
  const config = { mutationsQueueName: "test", storage: localStorage };
  beforeEach(() => {
    testLink = new TestLink();
    onOffLink = new QueueLink(config);
    link = ApolloLink.from([onOffLink, testLink]);
  });

  it("forwards the operation", () => {
    return new Promise((resolve, reject) => {
      execute(link, op).subscribe({
        next: (data) => undefined,
        error: (error) => reject(error),
        complete: () => {
          expect(testLink.operations.length).eq(1);
          expect(testLink.operations[0].query).eq(op.query);
          resolve();
        }
      });
    });
  });

  it("holds requests when you close it", () => {
    onOffLink.close();
    const sub = execute(link, op).subscribe(() => null);
    expect(testLink.operations.length).eq(0);
    sub.unsubscribe();
  });

  it("removes operations from the queue that are cancelled while closed", () => {
    onOffLink.close();
    const observable = execute(link, op);
    const subscriber = observable.subscribe(() => { /* do nothing */ });
    subscriber.unsubscribe();
    onOffLink.open();
    expect(testLink.operations.length).eq(0);
  });

  it("Test mutation filter", () => {
    const onOffLinkFilter = new QueueLink(config, "mutation");
    onOffLinkFilter.close();
    const filterLink = ApolloLink.from([onOffLinkFilter, testLink]);
    execute(filterLink, op).subscribe({
    });
    expect(testLink.operations.length).eqls(1);
  });

  it("Test query filter", () => {
    const onOffLinkFilter = new QueueLink(config, "query");
    onOffLinkFilter.close();
    const filterLink = ApolloLink.from([onOffLinkFilter, testLink]);
    execute(filterLink, op).subscribe({
    });
    onOffLinkFilter.open();
    expect(testLink.operations.length).eqls(1);
  });

  it("store test", () => {
    let operations: any[] = [];
    const storageEngine = {
      getItem() {
        return JSON.stringify(operations);
      },
      removeItem() {
        operations = [];
      },
      setItem(key: string, content: any) {
        console.info(content);
        operations = JSON.parse(content);
      }
    };
    const localConfig = { mutationsQueueName: "test", storage: storageEngine };
    const onOffLinkFilter = new QueueLink(localConfig);
    onOffLinkFilter.close();
    const filterLink = ApolloLink.from([onOffLinkFilter, testLink]);
    execute(filterLink, op).subscribe({
    });
    onOffLinkFilter.open();
    expect(testLink.operations.length).equal(1);
  });

  it("store test promises", () => {
    let operations: any[] = [];
    const storageEngine = {
      getItem() {
        return Promise.resolve(JSON.stringify(operations));
      },
      removeItem() {
        operations = [];
      },
      setItem(key: string, content: any) {
        console.info(content);
        operations = JSON.parse(content);
      }
    };
    const localConfig = { mutationsQueueName: "test", storage: storageEngine };
    const onOffLinkFilter = new QueueLink(localConfig);
    onOffLinkFilter.close();
    const filterLink = ApolloLink.from([onOffLinkFilter, testLink]);
    execute(filterLink, op).subscribe({
    });
    onOffLinkFilter.open();
    expect(testLink.operations.length).equal(1);
  });

  it("noSquash Directive test", () => {
    let operations: any[] = [];
    const storageEngine = {
      getItem() {
        return operations;
      },
      removeItem() {
        operations = [];
      },
      setItem(key: string, content: any) {
        console.info(content);
        operations = JSON.parse(content);
      }
    };
    const localConfig = { mutationsQueueName: "test", storage: storageEngine };
    const queueLink = new QueueLink(localConfig);
    queueLink.close();
    queueLink.request(opDirective, {} as NextLink).subscribe({});
    queueLink.request(opDirective, {} as NextLink).subscribe({});
    expect(localConfig.storage.getItem().length).eqls(2);
  });
});
