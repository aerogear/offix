// polyfills that let us test in node
import "fake-indexeddb/auto";
// import "cross-fetch/polyfill";
import 'whatwg-fetch'

import { HttpLink } from "apollo-link-http";
import { ApolloOfflineClient, ApolloOfflineQueueListener } from "../src";
import { InMemoryCache } from "apollo-cache-inmemory";

test("OfflineClient constructor does not throw", async () => {
  const url = "http://test";
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    httpUrl: url
  });
  await client.init();
});

test("OfflineClient using terminatingLink", async () => {
  const url = "http://test";
  const terminatingLink = new HttpLink({ uri: url });
  const client = new ApolloOfflineClient({
    terminatingLink,
    cache: new InMemoryCache()
  });
  await client.init();
});

test("ApolloOfflineClient throws when invalid config is given", async () => {
  //@ts-ignore
  expect(() => new ApolloOfflineClient()).toThrow("Missing url");
});

test("registerOfflineEventListener adds the listener to the queue listeners", async () => {
  const url = "http://test";
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    httpUrl: url
  });
  await client.init();

  expect(client.queue.listeners.length).toBe(1); // the default one added in by the client

  const listener: ApolloOfflineQueueListener = {
    /* tslint:disable:no-empty */
    onOperationEnqueued: (op) => { }
  };
  client.registerOfflineEventListener(listener);
  expect(client.queue.listeners.length).toBe(2);
  expect(client.queue.listeners[1]).toBe(listener);
});
