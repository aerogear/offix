// tslint:disable-next-line:ordered-imports
import {
  ApolloLink, execute, GraphQLRequest
} from "apollo-link";
import gql from "graphql-tag";
import QueueLink from "../src/links/QueueLink";
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

  beforeEach(() => {
    testLink = new TestLink();
    onOffLink = new QueueLink(localStorage, "test");
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
});
