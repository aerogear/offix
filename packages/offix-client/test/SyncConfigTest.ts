import { SyncConfig } from "../src/config/SyncConfig";
import { expect } from "chai";
import { ConfigurationService } from "@aerogear/core";
import { ConflictResolutionData } from "../src/conflicts/strategies/ConflictResolutionData";
import { DataSyncConfig } from "../src/config/DataSyncConfig";
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
  const configWithStrategy: DataSyncConfig = {
    httpUrl: "test",
    storage,
    conflictStrategy: {
      resolve: (base: ConflictResolutionData, server: ConflictResolutionData, client: ConflictResolutionData) => server
    }
  };

  it("merges config", () => {
    const config = new SyncConfig(userConfig);
    expect(config.httpUrl).eq(userConfig.httpUrl);
    expect(config.retryOptions).eq(userConfig.retryOptions);
  });

  it("validates config", () => {
    const badConstructor = () => new SyncConfig({ storage });
    expect(badConstructor).to.throw();
  });

  it("applyPlatformConfig", () => {
    const app = new ConfigurationService({
      clusterName: "",
      version: 1,
      namespace: "Test",
      services: [
        {
          id: "sync",
          name: "sync",
          type: "sync-app",
          url: userConfig.httpUrl,
          config: {}
        }
      ]
    });
    const mergedConfig = new SyncConfig({ openShiftConfig: app, storage });
    expect(mergedConfig.httpUrl).eq(userConfig.httpUrl);
  });

  it("conflict strategy is a function", () => {
    const mergedConfig = new SyncConfig(configWithStrategy);
    if (mergedConfig.conflictStrategy && mergedConfig.conflictStrategy) {
      expect(mergedConfig.conflictStrategy.resolve).to.be.a("Function");
    }
  });

});
