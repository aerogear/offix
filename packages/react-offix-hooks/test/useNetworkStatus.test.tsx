/* eslint-disable */
import React from "react";
import "fake-indexeddb/auto";
import "cross-fetch/polyfill";
import { renderHook, act } from "@testing-library/react-hooks";
import { ApolloOfflineProvider, useNetworkStatus } from "../src";
import { ApolloOfflineClient } from "offix-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { MockNetworkStatus } from "./mock/MockNetworkStatus";

const createClient = async ({ online } : { online: boolean }) => {
  const link = new HttpLink({ uri: "http://test" });
  const networkStatus = new MockNetworkStatus();
  networkStatus.setOnline(online);
  const client = new ApolloOfflineClient({
    cache: new InMemoryCache(),
    link,
    networkStatus
  });
  await client.init();
  return client;
};

const createWrapper = ({ client } : { client: ApolloOfflineClient }) => {
  // @ts-ignore
  return ({ children }: any) => (
    <ApolloOfflineProvider client={client}>
      {children}
    </ApolloOfflineProvider>
  );
};

test("useNetworkStatus hook should return true when the network is initially online", async () => {
  const client = await createClient({ online: true });
  const wrapper = createWrapper({ client });
  const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
  await waitForNextUpdate();
  expect(result.current).toBe(true);
});

test("useNetworkStatus hook should return false when the netwrok is initially offline", async () => {
  const client = await createClient({ online: false });
  const wrapper = createWrapper({ client });
  const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
  await waitForNextUpdate();
  expect(result.current).toBe(false);
});

test("useNetworkStatus hook status should return false when network goes offline", async () => {
  const client = await createClient({ online: true });
  const wrapper = createWrapper({ client });
  const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
  await waitForNextUpdate();
  expect(result.current).toBe(true);

  act(() => {
    // @ts-ignore
    client.networkStatus.setOnline(false);
  });

  expect(result.current).toBe(false);
});

test("useNetworkStatus hook status should return false when network comes back online", async () => {
  const client = await createClient({ online: false });
  const wrapper = createWrapper({ client });
  const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
  await waitForNextUpdate();
  expect(result.current).toBe(false);

  act(() => {
    // @ts-ignore
    client.networkStatus.setOnline(true);
  });

  expect(result.current).toBe(true);
});
