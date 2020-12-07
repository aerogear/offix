import { Model } from "./Model";
import { LocalStorage, StorageAdapter } from "./storage";
import { GraphQLReplicator } from "./replication/GraphQLReplicator";
import { IndexedDBStorageAdapter } from "./storage/adapters/indexedDB/IndexedDBStorageAdapter";
import { ModelSchema, ModelJsonSchema } from "./ModelSchema";
import { DataStoreConfig } from "./DataStoreConfig";
import { createLogger, enableLogger } from "./utils/logger";
import { ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import { mutationQueueModel, metadataModel } from "./replication/api/MetadataModels";
import { Filter } from "./filters";

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
}

/**
 * ____ Offix DataStore ___
 * Client side storage with efficient querying capabilities
 * and GraphQL replication engine.
 */
export class DataStore {
  private storage: LocalStorage;
  private replicator?: GraphQLReplicator;
  private config: DataStoreConfig;
  private models: Model[];

  constructor(config: DataStoreConfig, engines?: CustomEngines) {
    this.config = config;
    this.models = [];
    if (engines && engines.storeAdapter) {
      this.storage = new LocalStorage(engines.storeAdapter);
    } else {
      const name = this.config.dbName || "offixdb";
      const version = this.config.schemaVersion || 1;
      const indexedDB = new IndexedDBStorageAdapter(name, version);
      this.storage = new LocalStorage(indexedDB);
    }
  }

  /**
   * Initialize specific model using it's schema.
   *
   * @param schema - model schema containing fields and other details used to persist data
   * @param replicationConfig optional override for replication configuration for this particular model
   */
  public setupModel<T>(schema: ModelJsonSchema<T>, replicationConfig?: ModelReplicationConfig) {
    const modelSchema = new ModelSchema(schema);
    const model = new Model<T>(modelSchema, this.storage, replicationConfig);
    this.models.push(model);
    return model;
  }

  /**
   * Initialize datastore
   */
  public init() {
    if (this.models) {
      if (this.config.replicationConfig) {
        this.replicator = new GraphQLReplicator(this.models, this.config.replicationConfig);
        // Add replication stores
        this.storage.addStore(mutationQueueModel);
        this.storage.addStore(metadataModel);
        this.storage.createStores();
        this.replicator.init(this.storage);
      } else {
        this.storage.createStores();
        logger("Replication configuration was not provided. Replication will be disabled");
      }
    }
  }

  public restartReplicator(model: Model, filter: Filter) {
    if (this.replicator) {
      model.applyReplicationFilter(filter);
      this.replicator.resartReplicators(model);
    }
  }
}
