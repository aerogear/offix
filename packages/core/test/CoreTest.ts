import { assert, expect } from "chai";
import mocha from "mocha";
import { AeroGearConfiguration, ServiceConfiguration } from "../src/config";
import { AgsCore } from "../src/Core";
import testConfigJson from "./mobile-config.json";

declare var global: any;
declare var window: any;

global.window = {};
window.localStorage = {
  getItem: () => {
    console.info("Called");
  },
  setItem: () => {
    console.info("Called");
  }
};

describe("AgsCore Tests", () => {

  const aerogearConfig = testConfigJson as AeroGearConfiguration;
  let core: AgsCore;

  beforeEach(async () => {
    core = new AgsCore();
    core.init(aerogearConfig);
  });

  describe("#constructor", () => {

    it("should throw if configuration is null/undefined", async () => {

      core.init({} as AeroGearConfiguration).then(() => {
        assert.fail("Should not return if config is {}");
      });
    });

    it("should instantiate an array of configurations from a mobile-config JSON", () => {
      const services = testConfigJson.services;
      const configurations = core.configurations;

      assert.isArray(configurations);
      assert.equal(configurations, services);
    });
  });

  describe("#getConfig", () => {

    it("should return empty array if using an nonexistent key", () => {
      const result = core.getConfigByType("foo");

      assert.isArray(result);
      assert.isOk(result.length === 0);
    });

    it("should be able to get config if its key exists", () => {
      const result = core.getConfigByType("keycloak");
      expect(result[0].type).to.equal("keycloak");
    });

  });
});
