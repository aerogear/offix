import find from "lodash.find";
import { AeroGearConfiguration, ServiceConfiguration } from "./";

/**
 * List of types of all supported services.
 */
export type ServiceType = "metrics" | "keycloak" | "push";

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

  public getConfig(type: ServiceType): ServiceConfiguration | undefined {
    return find(this.configurations, service => service.type === type);
  }
}
