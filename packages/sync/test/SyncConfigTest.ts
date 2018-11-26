// tslint:disable-next-line:ordered-imports
import { SyncConfig } from "../src/config/SyncConfig";
import { INSTANCE } from "@aerogear/core"

import { expect } from "chai";

declare var global: any;
declare var window: any;

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
    INSTANCE.init({
      clusterName: "",
      version: 1,
      namespace: "Test",
      services: [
        {
          id: "sync",
          name: "sync",
          type: "sync",
          url: clientConfig.httpUrl,
          config: {}
        }
      ]
    });
    config.applyPlatformConfig(config);
    expect(config.merge({}).httpUrl).eq(clientConfig.httpUrl);
  });
});
