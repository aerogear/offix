import { DeltaQueriesConfig } from "../api/ReplicationConfig";
import { NetworkStatus } from "../../network/NetworkStatus";
import { ModelPredicate } from "../../predicates";
import { DocumentNode } from "graphql";
import { Client } from "urql";


export class DeltaReplicator {
  private config: DeltaQueriesConfig;
  private client: Client;
  private networkStatus: NetworkStatus;

  constructor(config: DeltaQueriesConfig, client: Client, networkStatus: NetworkStatus) {
    this.config = config;
    this.client = client;
    this.networkStatus = networkStatus;

  }

  public start(query: DocumentNode, predicate: ModelPredicate) {

    // convertPredicateToFilter()
  }
}
