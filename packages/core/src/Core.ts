import find from "lodash.find";
import console from "loglevel";
import { AeroGearConfiguration, ServiceConfiguration } from "./config";
import { MetricsService } from "./metrics";
/**
 * AeroGear services core class.
 * Defines internal api and helpers to be used by all top level SDK's
 */
export class AgsCore {

  public configurations?: ServiceConfiguration[];
  public metrics?: MetricsService;

  /**
   * Initialize all AeroGear services SDK's
   *
   * @param config configuration that should be injected to all available SDK's
   */
  public init(config: AeroGearConfiguration): void {
    if (!config || !config.services || config.services.length === 0) {
      return console.error("Invalid configuration format for AeroGear SDK");
    }
    this.configurations = config.services;
    this.metrics = new MetricsService();
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
      return find(this.configurations, service => !!service.id && service.id.toLowerCase() === id.toLowerCase());
    }
    console.error("Configuration not initialized.");
  }

}

export let INSTANCE = new AgsCore();
