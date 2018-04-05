import { find } from "lodash";
import { AeroGearConfiguration, ServiceConfiguration } from "./";

/**
 * Represents a configuration parser.
 * Class abstracts from where configuration will come from and expect
 */
export class ConfigurationParser {

  private readonly configurations: ServiceConfiguration[];

  /**
   * @param config - top level configuration that will be send from server.
   */
  constructor(config: AeroGearConfiguration) {
    this.configurations = config.services || [];
  }

  public getKeycloakConfig(): ServiceConfiguration {
    return this.configByKey("keycloak");
  }

  public getMetricsConfig(): ServiceConfiguration {
    return this.configByKey("metrics");
  }

  public configByKey(key: string): any {
    return find(this.configurations, service => service.type === key);
  }
}
