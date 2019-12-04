// polyfills that let us test in node
import "fake-indexeddb/auto";
import "cross-fetch/polyfill";

import { HttpLink } from "apollo-link-http";
import { ApolloOfflineClient, ApolloOfflineQueueListener, MutationHelperOptions } from "../src";
import { InMemoryCache } from "apollo-cache-inmemory";

test("OfflineClient constructor does not throw", async () => {
  const link = new HttpLink({ uri: "http://test" });
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    link
  });
  await client.init();
});

test("OfflineClient constructor throws if no link provided", async () => {
  expect(() => new ApolloOfflineClient({cache: new InMemoryCache()})).toThrow("config missing link property");
});

test("client.initialized is false before client.init and true afterwards", async () => {
  const link = new HttpLink({ uri: "http://test" });
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    link
  });
  expect(client.initialized).toBe(false);
  await client.init();
  expect(client.initialized).toBe(true);
});

test("client.offlineMutate throws an error if client is not initialized", async () => {
  const link = new HttpLink({ uri: "http://test" });
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    link
  });
  await expect(client.offlineMutate({} as MutationHelperOptions)).rejects.toThrow("cannot call client.offlineMutate until client is initialized");
});

test("registerOfflineEventListener adds the listener to the queue listeners", async () => {
  const link = new HttpLink({ uri: "http://test" });
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    link
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
