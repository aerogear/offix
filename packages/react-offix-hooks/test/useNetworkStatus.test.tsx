/* eslint-disable */
import React from "react";
import "fake-indexeddb/auto";
import "cross-fetch/polyfill";
import { renderHook, act, cleanup } from "@testing-library/react-hooks";
import { ApolloOfflineProvider, useNetworkStatus } from "../src";
import { ApolloOfflineClient } from "offix-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { MockNetworkStatus } from "./mock/MockNetworkStatus";

let client: ApolloOfflineClient;
let wrapper: any;
let link: HttpLink;
let networkStatus: MockNetworkStatus;

describe("useNetworkStatus hook changes when network is already offline", () => {
  beforeEach(async () => {
    link = new HttpLink({ uri: "http://test" });
    networkStatus = new MockNetworkStatus();
    client = new ApolloOfflineClient({
      cache: new InMemoryCache(),
      link,
      networkStatus
    });
    await client.init();

    // @ts-ignore
    wrapper = ({children}: any) => (
      <ApolloOfflineProvider client={client}>
        { children }
      </ApolloOfflineProvider>
    );
  });
  
  afterEach(cleanup);
  
  test("useNetworkStatus hook should return true initially", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toBe(true);
  });
  
  test("useNetworkStatus hook status should change from true to false when network status changes", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toBe(true);
  
    act(() => {
      // @ts-ignore
      client.networkStatus.setOnline(false);
    });
  
    expect(result.current).toBe(false);
  });
});

describe("useNetworkStatus hook changes when network is already offline", () => {
  beforeEach(async () => {
    link = new HttpLink({ uri: "http://test" });
    networkStatus = new MockNetworkStatus();
    networkStatus.setOnline(false);
    client = new ApolloOfflineClient({
      cache: new InMemoryCache(),
      link,
      networkStatus
    });
    await client.init();

    // @ts-ignore
    wrapper = ({children}: any) => (
      <ApolloOfflineProvider client={client}>
        { children }
      </ApolloOfflineProvider>
    );
  });
  
  afterEach(cleanup);
  
  test("useNetworkStatus hook should return false initially", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toBe(false);
  });
  
  test("useNetworkStatus hook status should change from false to true when network status changes", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toBe(false);
  
    act(() => {
      // @ts-ignore
      client.networkStatus.setOnline(true);
    });
  
    expect(result.current).toBe(true);
  });
})

