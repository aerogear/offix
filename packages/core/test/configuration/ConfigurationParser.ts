import { assert, expect } from "chai";
import mocha from "mocha";
import { AeroGearConfiguration, ConfigurationParser, ServiceConfiguration } from "../../src/configuration";
import testConfigJson from "../mobile-config.json";

describe("ConfigurationParser", () => {

  const aerogearConfig = testConfigJson as AeroGearConfiguration;
  let parser: ConfigurationParser;

  beforeEach(() => {
    parser = new MockConfigurationParser(aerogearConfig);
  });

  describe("#constructor", () => {

    it("should throw if configuration is null", () => {
      const constructor = () => new MockConfigurationParser(null);
      expect(constructor).to.throw();
    });

    it("should throw if configuration is undefined", () => {
      const constructor = () => new MockConfigurationParser(undefined);
      expect(constructor).to.throw();
    });

    it("should not instantiate null configurations", () => {
      const emptyParser = new MockConfigurationParser({} as AeroGearConfiguration);
      const configurations = emptyParser.getConfigurations();

      assert.isArray(configurations);
    });

    it("should instantiate an array of configurations from a mobile-config JSON", () => {
      const services = testConfigJson.services;
      const configurations = (parser as MockConfigurationParser).getConfigurations();

      assert.isArray(configurations);
      assert.equal(configurations, services);
    });
  });

  describe("#getConfig", () => {

    it("should return undefined if using an nonexistent key", () => {
      const result = parser.getConfig("foo");

      assert.isUndefined(result);
    });

    it("should be able to get config if its key exists", () => {
      const result = parser.getConfig("keycloak");

      expect(result.type).to.equal("keycloak");
    });

    it("should be able to get keycloak config", () => {
      const keycloakConfig = parser.getKeycloakConfig();

      assert.equal(keycloakConfig.type, "keycloak");
    });

    it("should be able to get metrics config", () => {
      const metricsConfig = parser.getMetricsConfig();

      assert.equal(metricsConfig.type, "metrics");
    });

    it("should be able to get push config", () => {
      const metricsConfig = parser.getPushConfig();

      assert.equal(metricsConfig.type, "push");
    });

  });

  class MockConfigurationParser extends ConfigurationParser {

    public getConfigurations(): ServiceConfiguration[] {
      return this.configurations;
    }

  }

});
