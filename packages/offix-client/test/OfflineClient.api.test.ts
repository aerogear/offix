// polyfills that let us test in node
import "fake-indexeddb/auto";
import "cross-fetch/polyfill";

import { HttpLink } from "apollo-link-http";
import { OfflineClient, createClient, ApolloOfflineQueueListener } from "../src";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

test("createClient does not throw", async () => {
  const url = "http://test";

  const client = await createClient({ httpUrl: url });

  expect(client).toBeDefined();
  expect(client instanceof ApolloClient).toBe(true);
});

test("OfflineClient constructor does not throw", async () => {
  const url = "http://test";
  const client = new OfflineClient({
    httpUrl: url
  });
  const initClient = await client.init();
  expect(client.apolloClient).toBeDefined();
  expect(initClient.offlineStore).toBeDefined();
  expect(client.registerOfflineEventListener).toBeDefined();
});

test("OfflineClient accepts user provided cache", async () => {

  const cache = new InMemoryCache();

  const url = "http://test";

  const offlineClient = new OfflineClient({
    httpUrl: url,
    cache
  });

  const client = await offlineClient.init();

  expect(client).toBeDefined();
  expect(client.cache).toBe(cache);
  expect(client instanceof ApolloClient).toBe(true);
});

test("OfflineClient does not accept non InMemoryCache cache implementation", async () => {

  const cache = { not: "valid" } as unknown as InMemoryCache;

  const url = "http://test";

  function createNewClient() {
    return new OfflineClient({
      httpUrl: url,
      cache
    });
  }

  expect(createNewClient).toThrowError("Unsupported cache. cache must be an InMemoryCache");
});

test("OfflineClient using terminatingLink", async () => {
  const url = "http://test";
  const terminatingLink = new HttpLink({ uri: url });
  const client = new OfflineClient({ terminatingLink });
  await client.init();
  expect(client.apolloClient).toBeDefined();
  expect(client.offlineStore).toBeDefined();
});

test("client.init() throws when invalid config is given", async () => {
  // @ts-ignore
  const client = new OfflineClient();
  await expect(client.init()).rejects.toThrow("Missing url");
});

test("registerOfflineEventListener adds the listener to the queue listeners", async () => {
  const url = "http://test";
  const client = new OfflineClient({
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
