/**
 * Service configuration model
 */
export interface ServiceConfig {
  id: string;
  name: string;
  type: string;
  url: string;
  config: any;
}

/**
 * Represents top level mobile configuration
 */
export interface AeroGearConfig {
  version: number;
  clusterName: string;
  namespace: string;
  services?: ServiceConfig[];
}

/**
 * Represents configuration parser.
 * Class abstracts from where configuration will come from and expect
 */
export class ConfigService {
  private serviceConfig: ServiceConfig[] = [];

  /**
   * @param config - any type of configuration that will be send from server.
   */
   constructor(config: AeroGearConfig) {
     if (config && config.services) {
       this.serviceConfig = config.services;
     }
   }

   public getKeycloakConfig(): ServiceConfig {
     return this.configByKey('keycloak');
   }

   public getMetricsConfig(): ServiceConfig {
     return this.configByKey('metrics');
   }

   public configByKey(key: string): any {
     const array = this.serviceConfig.filter(config => config.type === key);
     return array.pop();
   }
 }
