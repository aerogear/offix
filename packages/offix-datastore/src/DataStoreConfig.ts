import { GlobalReplicationConfig } from "./replication/api/ReplicationConfig";

/**
 * Configuration Options for DataStore
 */
export interface DataStoreConfig {
  /**
   * The Database name
   */
  dbName?: string;

  /**
  * The Schema Version number. Used to trigger a Schema upgrade
  */
  schemaVersion?: number;

  /**
   * Configuration for replication engine
   */
  replicationConfig?: GlobalReplicationConfig
}
