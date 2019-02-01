import { assert, expect } from "chai";
import mocha from "mocha";
import { AeroGearConfiguration, ConfigurationService } from "../src/index";
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

describe("Config Tests", () => {
  const aerogearConfig = testConfigJson as AeroGearConfiguration;
  let core: ConfigurationService;

  beforeEach(async () => {
    core = new ConfigurationService(aerogearConfig);
  });

  describe("#constructor", () => {
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
