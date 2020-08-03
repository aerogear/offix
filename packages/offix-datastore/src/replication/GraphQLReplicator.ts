
import { IReplicator } from "./api/Replicator";
import { LocalStorage } from "../storage";
import { Model } from "../Model";
import { WebNetworkStatus } from "../network/WebNetworkStatus";
import { NetworkStatus } from "../network/NetworkStatus";
import { GlobalReplicationConfig, ModelReplicationConfig } from "./api/ReplicationConfig";
import { createGraphQLClient } from "./utils/createGraphQLClient";
import { ModelReplication } from "./ModelReplication";
import { Client } from "urql";

/**
 * Defaults for replicating settings aggregated in single place
 * for visibility and documentation.
 */
export const defaultConfig: GlobalReplicationConfig = {
  // Prevent specifying required fields
  client: {
  } as any,

  // Delta, Mutations and Subscriptions defaults
  delta: {
    enabled: true,
    pullInterval: 1000 * 60 * 1 // 1 minute
  },
  liveupdates: {
    enabled: true
  },
  mutations: {
    enabled: true
  }
};

/**
 * Performs replication using GraphQL
 */
export class GraphQLCRUDReplicator implements IReplicator {
  private client: Client;
  private config: GlobalReplicationConfig;
  private networkStatus: NetworkStatus;

  constructor(globalReplicationConfig: GlobalReplicationConfig) {
    this.config = Object.assign({}, defaultConfig, globalReplicationConfig);
    this.networkStatus = this.config.networkStatus || new WebNetworkStatus();
    this.client = createGraphQLClient(this.config.client);
  }

  public startModelReplication(model: Model, storage: LocalStorage) {
    let config: ModelReplicationConfig = this.config;
    if (model.replicationConfig) {
      config = Object.assign({}, this.config, model.replicationConfig);
    }

    // Replication on model level gives more refined control how individual
    // models are replicate and allows developers to directly control it.
    const modelReplication = new ModelReplication(model, storage, this.client);
    modelReplication.init(config, this.networkStatus);
    model.setReplicator(modelReplication);
  }
}
