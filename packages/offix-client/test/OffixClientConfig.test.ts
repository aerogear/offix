import "fake-indexeddb/auto";
import "cross-fetch/polyfill";
import { ApolloOfflineClientConfig } from "../src/config/ApolloOfflineClientConfig";
import { ApolloOfflineClientOptions } from "../src/config/ApolloOfflineClientOptions";
import { InMemoryCache } from "apollo-cache-inmemory";

test("ApolloOfflineClientConfig Merges defaults with user config", () => {

  const userConfig = {
    httpUrl: "test",
    // storage,
    retryOptions: {
      attempts: {
        max: 10
      }
    },
    cache: new InMemoryCache()
  };

  const config = new ApolloOfflineClientConfig(userConfig);
  expect(config.httpUrl).toBe(userConfig.httpUrl);
  expect(config.retryOptions).toBe(userConfig.retryOptions);
});

it("conflict strategy is a function", () => {
  const configWithStrategy: ApolloOfflineClientOptions = {
    httpUrl: "test",
    // storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    },
    cache: new InMemoryCache()
  };

  const mergedConfig = new ApolloOfflineClientConfig(configWithStrategy);
  expect(mergedConfig.conflictStrategy).toBe(configWithStrategy.conflictStrategy);
});
