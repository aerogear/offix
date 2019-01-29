// tslint:disable-next-line:ordered-imports
/// <reference types="@types/mocha" />
import {
  ApolloLink, execute, GraphQLRequest
} from "apollo-link";
import gql from "graphql-tag";
import { OfflineQueueLink as QueueLink, OperationQueueEntry } from "../src/links/OfflineQueueLink";
import {
  TestLink
} from "./TestUtils";
import { requestWithOnlineDirective } from "./operations";
import { expect } from "chai";
import { PersistentStore, PersistedData } from "../src/PersistentStore";
import { opWithSquashDirective } from "./operations";

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
  let operations: any[] = [];

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

  const queueEntryWithDirective: OperationQueueEntry = {
    operation: opWithSquashDirective,
    forward: {} as any,
    observer: {} as any
  };

  const config = { mutationsQueueName: "test", storage: localStorage };
  beforeEach(() => {
    testLink = new TestLink();
    onOffLink = new QueueLink(config);
    onOffLink.open();
    link = ApolloLink.from([onOffLink, testLink]);
    operations = [];
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

  it("test online only directive skips queue", () => {
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
    const customLink = ApolloLink.from([queueLink, testLink]);
    execute(customLink, requestWithOnlineDirective).subscribe({});
    expect(storageEngine.getItem.length).equal(0);
  });

  it("test online only operation makes it to termination", () => {
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
    const customLink = ApolloLink.from([queueLink, testLink]);
    execute(customLink, requestWithOnlineDirective).subscribe({});
    expect(testLink.operations.length).equal(1);
  });

  it("test turning off squashing in queue", () => {
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
    const localConfig = { mutationsQueueName: "test", storage: storageEngine, mergeOfflineMutations: false };
    const queueLink = new QueueLink(localConfig);
    queueLink.close();
    const customLink = ApolloLink.from([queueLink, testLink]);
    execute(customLink, op).subscribe({});
    execute(customLink, op).subscribe({});
    expect(localConfig.storage.getItem().length).equal(2);
  });

  it("store test", () => {
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

});
