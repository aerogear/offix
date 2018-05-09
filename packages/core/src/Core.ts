import find from "lodash.find";
import console from "loglevel";
import { AeroGearConfiguration, ServiceConfiguration } from "./config";

/**
 * AeroGear services core class.
 * Defines internal api and helpers to be used by all top level SDK's
 */
export class AgsCore {

  public configurations?: ServiceConfiguration[];

  /**
   * Initialize all AeroGear services SDK's
   *
   * @param config configuration that should be injected to all available SDK's
   */
  public init(config: AeroGearConfiguration): Promise<void> {
    if (!config || !config.services || config.services.length === 0) {
      return Promise.reject("Invalid configuration format");
    }
    this.configurations = config.services;
    return Promise.resolve();
  }

  /**
   * Get a service configuration object, provided an existing type is given
   * @param type - The type of the service
   */
  public getConfigByType(type: string): ServiceConfiguration[] | undefined {
    if (this.configurations) {
      return this.configurations.filter(service => service.type.toLowerCase() === type.toLowerCase());
    }
    console.error("Configuration not initialized.");
  }

  /**
   * Get a service configuration object, provided an existing id is given
   * @param id - unique id of the service
   */
  public getConfigById(id: string): ServiceConfiguration | undefined {
    if (this.configurations) {
      return find(this.configurations, service => service.id.toLowerCase() === id.toLowerCase());
    }
    console.error("Configuration not initialized.");
  }
}

export let coreInstance = new AgsCore();
