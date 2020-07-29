
import { MutationRequest } from "./MutationRequest";
import { LocalStorage, CRUDEvents } from "../../storage";
import { createLogger } from "../../utils/logger";
import { MUTATION_QUEUE } from "../api/Replicator";
import { Client, OperationResult } from "urql";
import { NetworkStatus, NetworkStatusEvent } from "../../network/NetworkStatus";
import { DocumentNode } from "graphql";

const logger = createLogger("queue");

/**
 * Queue that manages replication of the mutations for all local edits.
 */
// NOTE this queue was designed to be self sufficient and work in generic (GraphQL) cases as well
// We can use this in future for interoperability between generic cases and datastore
export class MutationsReplicationQueue {
  private items: MutationRequest[];
  private storage: LocalStorage;
  private client: Client;
  private networkStatus: NetworkStatus;
  private open: boolean;

  constructor(storage: LocalStorage, client: Client, networkStatus: NetworkStatus) {
    logger("Mutation queue created");
    this.items = [];
    this.open = false;
    this.client = client;
    this.storage = storage;
    this.networkStatus = networkStatus;
    this.networkStatus.subscribe({
      next: (message: NetworkStatusEvent) => {
        this.open = message.isOnline;
        if (this.open) {
          this.process();
        }
      },
      complete: () => {
        this.open = false;
      }
    })
  }

  /**
   * Perform mutation request that will:
   *
   * - Add request to the array of the current requests
   * - Save **all** requests to the store for this model
   * - Process requests (subject to network availability)
   * - Map id's
   *
   * @param request
   */
  addMutationRequest(request: MutationRequest) {
    this.items.push(request);
    // Save entire queue
    this.storage.save(MUTATION_QUEUE, this.items, "replication")
    logger("Saved Queue. Preparing to process");
    this.process();
  }

  public async process() {
    if (this.open) {
      return;
    }
    // Clone queue
    let currentItems = Object.assign({}, this.items) as MutationRequest[];
    while (open && currentItems.length != 0) {
      const isOffline = await this.networkStatus.isOnline();
      if (isOffline) {
        const item = currentItems.shift();
        logger("Mutation queue processing - online");
        const operationPromise = this.client.mutation(item?.mutation as DocumentNode, item?.variables).toPromise();
        operationPromise.then((data) => {
          this.resultProcessor(currentItems, item as MutationRequest, data);
          this.storage.save(MUTATION_QUEUE, currentItems);
          this.items = currentItems;
        }).catch((error => {
          if (this.errorHandler(error)) {
            // repeat request
            currentItems = this.items;
            this.open = true;
          } else {
            // TODO Log error
          };
        }));
      } else {
        this.open = false;
        logger("Mutation queue processing stopped - offline");
      }
    }
    // Work finished we can close queue
    this.open = false;
  }

  /**
   * Handler error
   * @param error
   */
  private errorHandler(error: any) {
    //TODO detect network error
    // TODO detect conflict error

    // Let user to decide if we want to requeue this particular change
    // TODO use user provided method to detect if error is repeatable.
    // TODo sensible defaults
    // TODO logging?
    return false;
  }

  private resultProcessor(queue: MutationRequest[], currentItem: MutationRequest, data: OperationResult<any>) {
    // TODO this might be part of the model config.
    this.storage.save(currentItem.storeName, data);
    if (currentItem.eventType === CRUDEvents.ADD) {
      for (const item of queue) {
        // TODO hardcoded id and hacky way to get object
        item.variables.id = data.data[Object.keys(data.data)[0]].id;
      }
    }
  }
}
