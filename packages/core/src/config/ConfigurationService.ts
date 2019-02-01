import find from "lodash.find";
import console from "loglevel";

import { ServiceConfiguration, AeroGearConfiguration } from "./";

/**
 * Abstraction for AeroGear configuration
 */
export class ConfigurationService {
  public configurations?: ServiceConfiguration[];

  /**
  * @param config configuration that should be injected to all available SDK's
  */
  public constructor(config: AeroGearConfiguration) {
    this.configurations = config.services;
  }

  /**
  * Get a service configuration object, provided an existing type is given
  * @param type - The type of the service
  */
  public getConfigByType(type: string): ServiceConfiguration[] | undefined {
    if (this.configurations) {
      return this.configurations.filter(service => service.type && service.type.toLowerCase() === type.toLowerCase());
    }
  }

  /**
   * Get a service configuration object, provided an existing id is given
   * @param id - unique id of the service
   */
  public getConfigById(id: string): ServiceConfiguration | undefined {
    if (this.configurations) {
      return find(this.configurations, service => {
        return !!service.id && service.id.toLowerCase() === id.toLowerCase();
      });
    }
    console.error("Configuration not initialized.");
  }
}
