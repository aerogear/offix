import "fake-indexeddb/auto";
import "cross-fetch/polyfill";
import validateConfig from "../src/config/ApolloOfflineClientConfigValidator";
import { ApolloOfflineClientConfig } from "../src/config/ApolloOfflineClientConfig";
import { ApolloOfflineClientOptions } from "../src/config/ApolloOfflineClientOptions";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";

test("ApolloOfflineClientConfig Merges defaults with user config", () => {

  const link = new HttpLink({ uri: "http://test" });

  const userConfig = {
    // storage,
    retryOptions: {
      attempts: {
        max: 10
      }
    },
    cache: new InMemoryCache(),
    link
  };

  const config = new ApolloOfflineClientConfig(userConfig);
  expect(config.cache).toBe(userConfig.cache);
  expect(config.retryOptions).toBe(userConfig.retryOptions);
});

it("conflict strategy is a function", () => {
  const link = new HttpLink({ uri: "http://test" });

  const configWithStrategy: ApolloOfflineClientOptions = {
    // storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    },
    cache: new InMemoryCache(),
    link
  };

  const mergedConfig = new ApolloOfflineClientConfig(configWithStrategy);
  expect(mergedConfig.conflictStrategy).toBe(configWithStrategy.conflictStrategy);
});

it("Should not throw for a valid config", () => {
  const link = new HttpLink({ uri: "http://test" });

  const configWithStrategy: ApolloOfflineClientOptions = {
    // storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    },
    cache: new InMemoryCache(),
    link
  };

  const config = new ApolloOfflineClientConfig(configWithStrategy);
  expect(() => validateConfig(config)).not.toThrow(Error);
});

it("Should throw for invalid config", () => {
  expect(() => validateConfig({} as any)).toThrow(Error);
});
