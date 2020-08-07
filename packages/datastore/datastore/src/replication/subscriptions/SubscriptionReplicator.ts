import { LiveUpdatesConfig } from "../api/ReplicationConfig";
import { Client } from "urql";
import { createLogger } from "../../utils/logger";
import { LocalStorage } from "../../storage";
import { Model } from "../../Model";
import { NetworkIndicator } from "../../network/NetworkIndicator";
import { ReplicatorSubscriptions } from "./ReplicatorSubscriptions";

const logger = createLogger("deltareplicator");

export interface SubscriptionReplicatorConfig {
  config: LiveUpdatesConfig;
  client: Client;
  networkIndicator: NetworkIndicator;
  queries: ReplicatorSubscriptions;
  storage: LocalStorage;
  model: Model;
}

/**
 * Replication engine for delta queris
 */
export class SubscriptionReplicator {
  private options: SubscriptionReplicatorConfig;

  constructor(options: SubscriptionReplicatorConfig) {
    this.options = options;
  }

  public async start() {
    logger("Subscription replication not implemented :)");
    // TODO
  }
}
