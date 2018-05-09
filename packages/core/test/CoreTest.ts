import { assert, expect } from "chai";
import mocha from "mocha";
import { AeroGearConfiguration, ServiceConfiguration } from "../src/config";
import { AgsCore } from "../src/Core";
import testConfigJson from "./mobile-config.json";

describe("AeroGear Core Tests", () => {

  const aerogearConfig = testConfigJson as AeroGearConfiguration;
  let parser: AgsCore;

  beforeEach(() => {
    parser = new AgsCore();
    parser.init(aerogearConfig);
  });

  describe("#constructor", () => {

    it("should throw if configuration is null", () => {
      parser.init(null).then(() => {
        assert.fail("Should not return if config is null");
      });

      parser.init(undefined).then(() => {
        assert.fail("Should not return if config is undefined");
      });

      parser.init({} as AeroGearConfiguration).then(() => {
        assert.fail("Should not return if config is undefined");
      });
    });

    it("should instantiate an array of configurations from a mobile-config JSON", () => {
      const services = testConfigJson.services;
      const configurations = parser.configurations;

      assert.isArray(configurations);
      assert.equal(configurations, services);
    });
  });

  describe("#getConfig", () => {

    it("should return undefined if using an nonexistent key", () => {
      const result = parser.getConfigByType("foo");

      assert.isArray(result);
      assert.isOk(result.length === 0);
    });

    it("should be able to get config if its key exists", () => {
      const result = parser.getConfigByType("keycloak");
      expect(result[0].type).to.equal("keycloak");
    });

  });
});
