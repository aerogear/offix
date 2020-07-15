import { Model, ModelConfig } from "./Model";
import { LocalStorage } from "./storage";
import { ReplicationEngine } from "./replication";
import { UrqlGraphQLClient } from "./replication/client/UrqlGraphQLClient";
import { GraphQLCRUDReplicator } from "./replication/graphqlcrud/GraphQLCRUDReplicator";
import { buildGraphQLCRUDQueries } from "./replication/graphqlcrud/buildGraphQLCRUDQueries";
import { IReplicator } from "./replication/api/Replicator";

/**
 * Configuration Options for DataStore
 */
export interface DataStoreConfig {
  /**
   * The Database name
   */
  dbName: string;

  /**
   * The GraphQL endpoint for synchronisation
   */
  url: string;

  /**
   * The GraphQL endpoint for subscriptions
   */
  wsUrl?: string;

  /**
   * The Schema Version number. Used to trigger a Schema upgrade
   */
  schemaVersion?: number;
}

export class DataStore {
  private dbName: string;
  private schemaVersion: number;
  private models: Model<unknown>[];
  private storage?: LocalStorage;
  private url: string;
  private wsUrl?: string | undefined;

  constructor(config: DataStoreConfig) {
    this.dbName = config.dbName;
    this.schemaVersion = config.schemaVersion || 1; // return 1 is schemaVersion is undefined or 0
    this.url = config.url;
    this.wsUrl = config.wsUrl || undefined;
    this.models = [];
  }

  public createModel<T>(config: ModelConfig<T>) {
    const model = new Model<T>(config, () => {
      if (this.storage) { return this.storage; }
      throw new Error("DataStore has not been initialised");
    });
    this.models.push(model);
    return model;
  }

  public init() {
    this.storage = new LocalStorage(this.dbName, this.models, this.schemaVersion);
    const gqlClient = new UrqlGraphQLClient(this.url, this.wsUrl);
    const queries = buildGraphQLCRUDQueries(this.models);
    const gqlReplicator = new GraphQLCRUDReplicator(gqlClient, queries);
    const engine = new ReplicationEngine(gqlReplicator, (this.storage as LocalStorage));
    this.pushReplicator(gqlReplicator);
    engine.start();
  }

  private pushReplicator(replicator: IReplicator) {
    this.models.forEach((model) => {
      model.setReplicator(replicator);
    });
  }

}
