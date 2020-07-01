import { Storage } from "./storage";
import { Model, Fields } from "./Model";
import { ReplicationEngine, GraphQLReplicator, UrqlGraphQLClient, GraphQLCrudQueryBuilder } from "./replication";

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
     * The Schema Version number. Used to trigger a Schema upgrade
     */
    schemaVersion?: number;
}

export class DataStore {
    private dbName: string;
    private schemaVersion: number;
    private models: Model<any>[];
    private storage?: Storage;
    private url: string;

    constructor(config: DataStoreConfig) {
        this.dbName = config.dbName;
        this.schemaVersion = config.schemaVersion || 1; // return 1 is schemaVersion is undefined or 0
        this.url = config.url;
        this.models = [];
    }

    public create<T>(name: string, storeName: string, fields: Fields<T>) {
        const model = new Model<T>(name, storeName, fields, () => {
            if (this.storage) { return this.storage; }
            throw new Error("DataStore has not been initialised");
        });
        this.models.push(model);
        return model;
    }

    public init() {
        this.storage = new Storage(this.dbName, this.models, this.schemaVersion);

        const gqlClient = new UrqlGraphQLClient(this.url);
        const queryBuilder = new GraphQLCrudQueryBuilder();
        const queries = queryBuilder.build(this.models);
        const gqlReplicator = new GraphQLReplicator(gqlClient, queries);

        const engine = new ReplicationEngine(gqlReplicator, (this.storage as Storage));
        engine.start();
    }
}
