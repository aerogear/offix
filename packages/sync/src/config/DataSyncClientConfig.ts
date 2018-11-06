import { PersistedData, PersistentStore } from "../PersistentStore";

/**
 * Contains all configuration options required to initialize SDK
 *
 * @see DefaultOptions for defaults
 */
export interface IDataSyncConfig {
  /**
   * Http server url
   */
  httpUrl?: string;

  /**
   * Websocket url
   */
  wsUrl?: string;

  /**
   * Describes name of the field used as ID
   */
  dataIdFromObject?: string | any;

  /**
   * Storage solution
   */
  storage?: PersistentStore<PersistedData>;
}
