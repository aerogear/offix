import chai, { expect } from "chai";
import { find } from "lodash";
import mocha from "mocha";
import sinon from "sinon";
import { ConfigurationParser } from "../../src/configuration/ConfigurationParser";
import { ServiceConfiguration } from "../../src/configuration/ServiceConfiguration";
import testAerogearConfig from "./mobile-config.json";

describe("ConfigurationParser", () => {

  let testSubject: ConfigurationParser;

  beforeEach(() => {
    testSubject = new ConfigurationParser(testAerogearConfig);
  });

  it("should be able to get keycloak config", () => {
    const keycloakConfig = testSubject.getKeycloakConfig();
    expect(keycloakConfig.name).to.equal("keycloak");
  });

  it("should be able to get metrics config", () => {
    const metricsConfig = testSubject.getMetricsConfig();
    expect(metricsConfig.name).to.equal("metrics");
  });

});
