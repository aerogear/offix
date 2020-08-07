import { ModelDeltaConfig } from "../api/ReplicationConfig";
import { NetworkStatusEvent, NetworkStatus } from "../../network/NetworkStatus";
import { DocumentNode } from "graphql";
import { Client, OperationResult, CombinedError } from "urql";
import { convertPredicateToFilter } from "../utils/convertPredicateToFilter";
import { createLogger } from "../../utils/logger";
import { LocalStorage } from "../../storage";
import { Model } from "../../Model";
import { DeltaReplicatorConfig } from "../queries/DeltaReplicator";

const logger = createLogger("deltareplicator");

export interface SubscriptionReplicatorConfig {
  config: ModelDeltaConfig;
  client: Client;
  networkInterface: NetworkStatus;
  query: DocumentNode;
  storage: LocalStorage;
  model: Model;
}

/**
 * Replication engine for delta queris
 */
export class SubscriptionReplicator {
  private options: DeltaReplicatorConfig;
  private filter: any;

  constructor(options: DeltaReplicatorConfig) {
    this.options = options;

  }

  public async start() {

  }
}
