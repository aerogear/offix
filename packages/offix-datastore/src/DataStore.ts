import { Model } from "./Model";
import { LocalStorage, StorageAdapter } from "./storage";
import { IReplicator } from "./replication/api/Replicator";
import { GraphQLCRUDReplicator } from "./replication/GraphQLCRUDReplicator";
import { IndexedDBStorageAdapter } from "./storage/adapters/IndexedDBStorageAdapter";
import { ModelSchema, DataSyncJsonSchema } from "./ModelSchema";
import { DataStoreConfig } from "./DataStoreConfig";
import { createLogger, enableLogger } from "./utils/logger";

const logger = createLogger("DataStore");
// TODO disable logging before release
enableLogger();

const metadataStoreName = "model_metadata"

/**
 * Custom implementation
 */
export interface CustomEngines {
  /**
   * Custom storage adapter.
   * By default DataStore will use IndexedDB that might not be available in every environment.
   * If you wish to override adapter you can supply it here
   */
  storeAdapter?: StorageAdapter,

  /**
   * Custom replication mechanism that will replicate data.
   * By default DataStore will be GraphQL (https://graphqlcrud.org) replication mechanism
   */
  replicator?: IReplicator
}

/**
 * ____ Offix DataStore ___
 * Client side storage with efficient querying capabilities
 * and GraphQL replication engine.
 */
export class DataStore {
  private models: Model<unknown>[];
  private storage: LocalStorage;

  private config: DataStoreConfig;
  private engines: CustomEngines | undefined;

  constructor(config: DataStoreConfig, engines?: CustomEngines) {
    this.config = config;
    this.models = [];
    this.engines = engines;

    if (engines && engines.storeAdapter) {
      this.storage = new LocalStorage(engines.storeAdapter);
    } else {
      const indexedDB = new IndexedDBStorageAdapter();
      this.storage = new LocalStorage(indexedDB);
    }
    this.storage.addStore({ name: metadataStoreName });
  }

  public createModel<T>(schema: DataSyncJsonSchema<T>) {
    const modelSchema = new ModelSchema(schema);
    const model = new Model<T>(modelSchema, this.storage);
    // TODO replace any with something better
    this.models.push(model as any);
    return model;
  }

  public init() {
    // TODO this fails on firefox


    if (this.config.replicationConfig) {
      if (this.engines?.replicator) {
        this.engines?.replicator.start(this.models, this.storage);
      } else {
        const gqlReplicator = new GraphQLCRUDReplicator(this.config.replicationConfig);
        gqlReplicator.start(this.models, this.storage);
      }
      this.storage.createStores(this.config);
    } else {
      logger("Replication configuration was not provided. Replication will be disabled");
    }
  }
}
