import { OffixDefaultConfig } from "../src/config/OffixDefaultConfig";
import { expect } from "chai";
import { ConflictResolutionData } from "offix-offline";
import { OffixClientConfig } from "../src/config/OffixClientConfig";
import { storage } from "./mock/Storage";

declare var global: any;

global.window = {};

describe("OnOffLink", () => {

  const userConfig = {
    httpUrl: "test",
    storage,
    retryOptions: {
      attempts: {
        max: 10
      }
    }
  };
  const configWithStrategy: OffixClientConfig = {
    httpUrl: "test",
    storage,
    conflictStrategy: {
      resolve: ({ base, server, client }) => server
    }
  };

  it("merges config", () => {
    const config = new OffixDefaultConfig(userConfig);
    expect(config.httpUrl).eq(userConfig.httpUrl);
    expect(config.retryOptions).eq(userConfig.retryOptions);
  });

  it("conflict strategy is a function", () => {
    const mergedConfig = new OffixDefaultConfig(configWithStrategy);
    if (mergedConfig.conflictStrategy && mergedConfig.conflictStrategy) {
      expect(mergedConfig.conflictStrategy.resolve).to.be.a("Function");
    }
  });

});
