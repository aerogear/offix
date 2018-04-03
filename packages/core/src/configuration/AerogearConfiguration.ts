import { ServiceConfiguration } from "./ServiceConfiguration";

/**
 * Represents top level mobile configuration
 */
export interface AeroGearConfiguration {

  readonly version: number;
  readonly clusterName: string;
  readonly namespace: string;
  readonly services?: ServiceConfiguration[];

}
