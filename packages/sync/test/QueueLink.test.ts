// tslint:disable-next-line:ordered-imports
import {
  ApolloLink, execute, GraphQLRequest
} from "apollo-link";
import gql from "graphql-tag";
import QueueLink from "../src/offline/QueueLink";
import {
  assertObservableSequence,
  TestLink
} from "./TestUtils";

import { expect } from "chai";

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
    onOffLink = new QueueLink();
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
  it("skips the queue when asked to", () => {
    const opWithSkipQueue: GraphQLRequest = {
      query: gql`{ hello }`,
      context: {
        skipQueue: true
      }
    };
    onOffLink.close();
    return new Promise((resolve, reject) => {
      execute(link, opWithSkipQueue).subscribe({
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
  it("passes through errors", () => {
    const testError = new Error("Hello darkness my old friend");
    const opWithError: GraphQLRequest = {
      query: gql`{ hello }`,
      context: {
        testError
      }
    };
    return new Promise((resolve, reject) => {
      resolve(assertObservableSequence(
        execute(link, opWithError),
        [
          { type: "error", value: testError }
        ]
      ));
    });
  });
  it("holds requests when you close it", () => {
    onOffLink.close();
    const sub = execute(link, op).subscribe(() => null);
    expect(testLink.operations.length).eq(0);
    sub.unsubscribe();
  });

  it("releases held requests when you open it", () => {
    onOffLink.close();
    return assertObservableSequence(
      execute(link, op),
      [
        { type: "next", value: testResponse },
        { type: "complete" }
      ],
      () => {
        expect(testLink.operations.length).eq(0);
        onOffLink.open();
      }
    );
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
