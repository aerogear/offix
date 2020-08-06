import { CRUDEvents, LocalStorage } from "../../storage";
import { Model } from "../../Model";
import { ModelReplicationConfig } from "./ReplicationConfig";
import { NetworkStatus } from "../../network/NetworkStatus";

/**
 * Operation to be pushed to Server
 */
export interface IOperation {
  eventType: CRUDEvents;
  input: any;
  storeName: string;
}

/**
 * Queue used to hold ongoing mutations
 */
export const MUTATION_QUEUE = "mutation_request_queue";
export const MUTATION_QUEUE_KEY = "storeName";

/**
 * Contains metadata for model
 */
export const MODEL_METADATA = "model_metadata";
export const MODEL_METADATA_KEY = "storeName";

/**
 * Replicator interface that every replication engine needs to satisfy.
 */
export interface IReplicator {
  /**
   * Start replication for this model
   * @param model - model used for replication
   * @param storage - local storage
   * @param replicationConfig - configuration for particular model that will override global config
   */
  startModelReplication(model: Model, storage: LocalStorage, replicationConfig?: ModelReplicationConfig): void;
}

/**
 * Replicator inteface used to expose replication operations that can be executed on the model
 */
export interface IModelReplicator {
  /**
   * __internal__ method should not be called by end users
   *
   * @param config model configuration
   * @param networkInterface - networkInterface used for this model
   */
  init(config: ModelReplicationConfig, networkInterface: NetworkStatus): void;

  /**
   * Force override delta query and perform query instantly (subject to network availability)
   * Use this method to make sure that you have fresh data from server (when no subscriptions provided)
   */
  forceDeltaQuery<T>(): Promise<void>;

  /**
   * Removes all metadata used to replicate model and starts with the new configuration
   */
  resetReplication<T>(config: ModelReplicationConfig): void;

  replicate(data: any, eventType: CRUDEvents): Promise<void>;
}
