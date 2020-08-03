import { Model } from "./Model";
import { LocalStorage, StorageAdapter } from "./storage";
import { IReplicator, MUTATION_QUEUE_KEY, MUTATION_QUEUE, MODEL_METADATA, MODEL_METADATA_KEY } from "./replication/api/Replicator";
import { GraphQLCRUDReplicator } from "./replication/GraphQLReplicator";
import { IndexedDBStorageAdapter } from "./storage/adapters/IndexedDBStorageAdapter";
import { ModelSchema, DataSyncJsonSchema } from "./ModelSchema";
import { DataStoreConfig } from "./DataStoreConfig";
import { createLogger, enableLogger } from "./utils/logger";

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
      const indexedDB = new IndexedDBStorageAdapter();
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

  public createModel<T>(schema: DataSyncJsonSchema<T>) {
    const modelSchema = new ModelSchema(schema);
    const model = new Model<T>(modelSchema, this.storage);
    this.replicator?.getModelReplicator(model, this.storage);
    return model;
  }

  public init() {
    // Created fixed stores for replication
    // TODO this is just workaround for replication engine
    this.storage.addStore({ name: MUTATION_QUEUE, keyPath: MUTATION_QUEUE_KEY });
    this.storage.addStore({ name: MODEL_METADATA, keyPath: MODEL_METADATA_KEY });
    // TODO this fails on firefox
    this.storage.createStores(this.config);
  }
}
