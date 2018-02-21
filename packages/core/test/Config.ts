import * as  chai from 'chai';
import * as sinon from 'sinon';
import { ConfigService } from '../src/Config';

/// <reference types="node" />

const { expect } = chai;

describe('ConfigService Tests', function() {
  const testConfig = require('./mobile-config.json');
  let testSubject: ConfigService;

  beforeEach(function() {
    testSubject = new ConfigService(testConfig);
  });

  it('should be able to get keycloak config', function() {
    const keycloakConfig = testSubject.getKeycloakConfig();
    expect(keycloakConfig.name).to.equal('keycloak');
  });

  it('should be able to get metrics config', function() {
    const metricsConfig = testSubject.getMetricsConfig();
    expect(metricsConfig.name).to.equal('metrics');
  });

});
