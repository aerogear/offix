import { SyncConfig } from "../src/config/SyncConfig";
import { expect } from "chai";
import {ConfigurationService} from "@aerogear/core";
declare var global: any;

global.window = {};

describe("OnOffLink", () => {
  const clientConfig = { httpUrl: "test" };

  it("merges config", () => {
    const config = new SyncConfig();
    const mergedConfig = config.merge(clientConfig);
    expect(mergedConfig.httpUrl).eq(clientConfig.httpUrl);
  });

  it("validates config", () => {
    const config = new SyncConfig();
    expect(config.validate).to.throw();
  });

  it("applyPlatformConfig when no config", () => {
    const config = new SyncConfig();
    config.applyPlatformConfig(config);
    expect(config.merge({}).httpUrl).eq(undefined);
  });

  it("applyPlatformConfig", () => {
    const config = new SyncConfig();
    const app = new ConfigurationService({
      clusterName: "",
      version: 1,
      namespace: "Test",
      services: [
        {
          id: "sync",
          name: "sync",
          type: "sync-app",
          url: clientConfig.httpUrl,
          config: {}
        }
      ]
    });
    const mergedConfig = config.merge({ openShiftConfig: app});
    config.applyPlatformConfig(mergedConfig);
    expect(mergedConfig.httpUrl).eq(clientConfig.httpUrl);
  });
});
