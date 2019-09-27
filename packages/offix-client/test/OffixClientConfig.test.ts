import "fake-indexeddb/auto";
import { OffixDefaultConfig } from "../src/config/OffixDefaultConfig";
import { OffixClientConfig } from "../src/config/OffixClientConfig";

test("OffixDefaultConfig Merges defaults with user config", () => {

  const userConfig = {
    httpUrl: "test",
    // storage,
    retryOptions: {
      attempts: {
        max: 10
      }
    }
  };

  const config = new OffixDefaultConfig(userConfig);
  expect(config.httpUrl).toBe(userConfig.httpUrl);
  expect(config.retryOptions).toBe(userConfig.retryOptions);
});

it("conflict strategy is a function", () => {
  const configWithStrategy: OffixClientConfig = {
    httpUrl: "test",
    // storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    }
  };

  const mergedConfig = new OffixDefaultConfig(configWithStrategy);
  expect(mergedConfig.conflictStrategy).toBe(configWithStrategy.conflictStrategy);
});
