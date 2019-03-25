import { SyncConfig } from "../src/config/SyncConfig";
import { expect } from "chai";
import { ConfigurationService } from "@aerogear/core";
import { ConflictResolutionData } from "../src/conflicts/ConflictResolutionData";
import { DataSyncConfig } from "../src/config/DataSyncConfig";

declare var global: any;

global.window = {};

describe("OnOffLink", () => {

  const userConfig = { httpUrl: "test", retryOptions: { attempts: { max: 10 } } };
  const configWithConflictDictionary: DataSyncConfig = {
    httpUrl: "test",
    conflictStrategy: {
      strategies: {
        "aMethod": (server: ConflictResolutionData, client: ConflictResolutionData) => server
      }
    }
  };

  it("merges config", () => {
    const config = new SyncConfig(userConfig);
    const mergedConfig = config.getClientConfig();
    expect(mergedConfig.httpUrl).eq(userConfig.httpUrl);
    expect(mergedConfig.retryOptions.attempts).eq(userConfig.retryOptions.attempts);
  });

  it("validates config", () => {
    const badConstructor = () => new SyncConfig();
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
    const config = new SyncConfig({ openShiftConfig: app });
    const mergedConfig = config.getClientConfig();
    expect(mergedConfig.httpUrl).eq(userConfig.httpUrl);
  });

  it("conflict strategy is a dictionary", () => {
    const config = new SyncConfig(configWithConflictDictionary);
    const mergedConfig = config.getClientConfig();
    expect(mergedConfig.conflictStrategy).to.be.an("object");
    if (mergedConfig.conflictStrategy && mergedConfig.conflictStrategy.strategies) {
      expect(mergedConfig.conflictStrategy.strategies.aMethod).to.be.a("Function");
    }
  });

  it("conflict strategy has a default", () => {
    const config = new SyncConfig(configWithConflictDictionary);
    const mergedConfig = config.getClientConfig();
    expect(mergedConfig.conflictStrategy).to.be.an("object");
    if (mergedConfig.conflictStrategy) {
      expect(mergedConfig.conflictStrategy.default).to.be.a("Function");
    }
  });
});
