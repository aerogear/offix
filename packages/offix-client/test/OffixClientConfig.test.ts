import "fake-indexeddb/auto";
import { OffixClientConfig } from "../src/config/OffixClientConfig";
import { OffixClientOptions } from "../src/config/OffixClientOptions";

test("OffixClientConfig Merges defaults with user config", () => {

  const userConfig = {
    httpUrl: "test",
    // storage,
    retryOptions: {
      attempts: {
        max: 10
      }
    }
  };

  const config = new OffixClientConfig(userConfig);
  expect(config.httpUrl).toBe(userConfig.httpUrl);
  expect(config.retryOptions).toBe(userConfig.retryOptions);
});

it("conflict strategy is a function", () => {
  const configWithStrategy: OffixClientOptions = {
    httpUrl: "test",
    // storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    }
  };

  const mergedConfig = new OffixClientConfig(configWithStrategy);
  expect(mergedConfig.conflictStrategy).toBe(configWithStrategy.conflictStrategy);
});
