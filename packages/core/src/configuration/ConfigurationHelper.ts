import find from "lodash.find";
import { AeroGearConfiguration, ServiceConfiguration } from "./";

/**
 * Helper class to read service configurations from a mobile-services.json file
 */
export class ConfigurationHelper {

  protected readonly configurations: ServiceConfiguration[];

  /**
   * @param config - top level configuration that will be send from server.
   */
  constructor(config: AeroGearConfiguration) {
    this.configurations = config.services || [];
  }

  /**
   * Get a service configuration object, provided an existing id is given
   * @param id string - The id of the service
   */
  public getConfig(id: string): ServiceConfiguration | undefined {
    return find(this.configurations, service => service.id.toLowerCase() === id.toLowerCase());
  }

}
