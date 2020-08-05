import { Model } from "./Model";
import { LocalStorage, StorageAdapter } from "./storage";
import { IReplicator } from "./replication/api/Replicator";
import { GraphQLCRUDReplicator } from "./replication/GraphQLReplicator";
import { IndexedDBStorageAdapter } from "./storage/adapters/IndexedDBStorageAdapter";
import { ModelSchema, DataSyncJsonSchema } from "./ModelSchema";
import { DataStoreConfig } from "./DataStoreConfig";
import { createLogger, enableLogger } from "./utils/logger";
import { ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import { queueModel, metadataModel } from "./replication/api/MetadataModels";

const logger = createLogger("DataStore");
// TODO disable logging before release
enableLogger();

/**
 * Custom implementation
 */
export interface CustomEngines {
  /**
   * Custom storage adapter.
   * By default DataStore will use IndexedDB that might not be available in every environment.
   * If you wish to override adapter you can supply it here
   */
  storeAdapter?: StorageAdapter;

  /**
   * Custom replication mechanism that will replicate data.
   * By default DataStore will be GraphQL (https://graphqlcrud.org) replication mechanism
   */
  replicator?: IReplicator;
}

/**
 * ____ Offix DataStore ___
 * Client side storage with efficient querying capabilities
 * and GraphQL replication engine.
 */
export class DataStore {
  private storage: LocalStorage;
  private replicator?: IReplicator;
  private config: DataStoreConfig;

  constructor(config: DataStoreConfig, engines?: CustomEngines) {
    this.config = config;

    if (engines && engines.storeAdapter) {
      this.storage = new LocalStorage(engines.storeAdapter);
    } else {
      const name = this.config.dbName || "offixdb";
      const version = this.config.schemaVersion || 1;
      const indexedDB = new IndexedDBStorageAdapter(name, config.schemaVersion);
      this.storage = new LocalStorage(indexedDB);
    }

    if (this.config.replicationConfig) {
      if (engines?.replicator) {
        this.replicator = engines.replicator;
      } else {
        this.replicator = new GraphQLCRUDReplicator(this.config.replicationConfig);
      }
    } else {
      logger("Replication configuration was not provided. Replication will be disabled");
    }
  }

  /**
   * Initialize specific model using it's schema.
   *
   * @param schema - model schema containing fields and other details used to persist data
   * @param replicationConfig optional override for replication configuration for this particular model
   */
  public setupModel<T>(schema: DataSyncJsonSchema<T>, replicationConfig?: ModelReplicationConfig) {
    const modelSchema = new ModelSchema(schema);
    const model = new Model<T>(modelSchema, this.storage);
    this.replicator?.startModelReplication(model, this.storage, replicationConfig);
    return model;
  }


  /**
   * Initialize
   */
  public init() {
    // Created fixed stores for replication
    // TODO this is just workaround for replication engine
    this.storage.addStore(queueModel);
    this.storage.addStore(metadataModel);
    // TODO this fails on firefox
    this.storage.createStores(this.config);
  }
}
