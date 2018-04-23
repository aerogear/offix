import find from "lodash.find";
import { AeroGearConfiguration, ServiceConfiguration } from "./";

/**
 * List of types of all supported services.
 */
export enum ServiceType {
  METRICS = "metrics",
  KEYCLOAK = "keycloak",
  PUSH = "push"
}

/**
 * Represents a configuration parser.
 * Class abstracts from where configuration will come from and expect
 */
export class ConfigurationParser {

  protected readonly configurations: ServiceConfiguration[];

  /**
   * @param config - top level configuration that will be send from server.
   */
  constructor(config: AeroGearConfiguration) {
    this.configurations = config.services || [];
  }

  /**
   * Get Metrics service configuration object
   */
  public getMetricsConfig(): ServiceConfiguration | undefined {
    return this.getConfig(ServiceType.METRICS);
  }

  /**
   * Get Keycloak service configuration object
   */
  public getKeycloakConfig(): ServiceConfiguration | undefined {
    return this.getConfig(ServiceType.KEYCLOAK);
  }

  /**
   * Get Push service configuration object
   */
  public getPushConfig(): ServiceConfiguration | undefined {
    return this.getConfig(ServiceType.PUSH);
  }

  /**
   * Get a service configuration object, provided an existing type is given
   * @param type string - The type of the service
   */
  public getConfig(type: string): ServiceConfiguration | undefined {
    return find(this.configurations, service => service.type === type);
  }

}
