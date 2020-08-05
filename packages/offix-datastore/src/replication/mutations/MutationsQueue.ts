
import travese from "traverse";
import { MutationRequest } from "./MutationRequest";
import { LocalStorage, CRUDEvents } from "../../storage";
import { createLogger } from "../../utils/logger";
import { MUTATION_QUEUE } from "../api/Replicator";
import { Client, OperationResult, CombinedError } from "urql";
import { NetworkStatus, NetworkStatusEvent } from "../../network/NetworkStatus";
import { DocumentNode } from "graphql";
import { ResultProcessor, UserErrorHandler } from "../api/ReplicationConfig";
import { Model } from "../../Model";
import { createPredicate } from "../../predicates";

const logger = createLogger("queue");

interface MutationReplicationOptions {
  storage: LocalStorage;
  model: Model;
  client: Client;
  networkStatus: NetworkStatus;
  errorHandler?: UserErrorHandler;
  resultProcessor?: ResultProcessor;
}

/**
 * Queue that manages replication of the mutations for all local edits.
 */
// NOTE this queue was designed to be self sufficient and work in generic (GraphQL) cases as well
// We can use this in future for interoperability between generic cases and datastore
export class MutationsReplicationQueue {
  private items: MutationRequest[];
  private open: boolean;
  private options: MutationReplicationOptions;

  constructor(options: MutationReplicationOptions) {
    logger("Mutation queue created");
    this.items = [];
    this.options = options;
    this.open = false;
  }

  /**
   * Initialize networkstatus and Queue to make sure that it is in proper state after startup.
   */
  public async init() {
    this.open = await this.options.networkStatus.isOnline();
    this.options.storage.query(MUTATION_QUEUE);

    // Subscribe to network updates and open and close replication
    this.options.networkStatus.subscribe({
      next: (message: NetworkStatusEvent) => {
        this.open = message.isOnline;
        if (this.open) {
          this.process();
        }
      },
      complete: () => {
        this.open = false;
      }
    });
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
  public addMutationRequest(request: MutationRequest) {
    this.items.push(request);
    // Save entire queue
    this.persistQueueTo();
    logger("Saved Queue. Preparing to process");
    this.process();
  }

  public async process() {
    this.open = await this.options.networkStatus.isOnline();
    if (!this.open) {
      logger("Client offline. Stop processsing queue");
      return;
    }
    // Clone queue
    let currentItems = Object.assign([], this.items) as MutationRequest[];
    while (this.open && currentItems.length !== 0) {
      const isOnline = await this.options.networkStatus.isOnline();
      if (isOnline) {
        const item = currentItems.shift();
        logger("Mutation queue processing - online");
        const operationPromise = this.options.client.mutation(item?.mutation as DocumentNode, item?.variables).toPromise();
        operationPromise.then((data) => {
          this.resultProcessor(currentItems, item as MutationRequest, data);
        }).catch((error: CombinedError) => {
          const retry = this.errorHandler(error, item as MutationRequest);
          if (retry) {
            this.items[0] = retry;
            // repeat request
          } else {
            logger("Unhandled error");
            // TODO Id should be accesible easily
            // TODO reset processing - while loop is not flexible here
            this.clearQueueById(item?.variables.input.id);
          };
          currentItems = this.items;
        });
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
  private errorHandler(error: CombinedError, request: MutationRequest) {
    logger("error happend when processing request", error);
    // TODO detect conflict error
    if (this.options.errorHandler) {
      logger("error handled by user");
      return this.options.errorHandler(error.networkError, error.graphQLErrors);
    }

    if (error.networkError !== undefined && error.graphQLErrors === undefined) {
      // TODO add number of retries
      // All auth errors should he handled by user error provider
      logger("error replied due to network error");
      return request;
    }

    return undefined;
  }

  private persistQueueTo(storage: LocalStorage = this.options.storage) {
    storage.save(MUTATION_QUEUE, { storeName: this.options.model.getStoreName(), items: this.items });
  }

  private async resultProcessor(queue: MutationRequest[], currentItem: MutationRequest, data: OperationResult<any>) {
    // TODO generic handling or responses
    // TODO hardcoded id and hacky way to get object
    const clientSideId = currentItem.variables.id;
    const response = data.data[Object.keys(data.data)[0]];
    if (currentItem.eventType === CRUDEvents.ADD) {
      queue.forEach((item) => {
        travese(item.variables).forEach(function (val) {
          if (this.isLeaf && val === clientSideId) {
            this.update(response.id);
          }
        });
      })
    }

    const transaction = await this.options.storage.createTransaction();
    // The only way to filter pending a better way
    const modelPredicate = createPredicate<any>(data as any);

    try {
      transaction.update(currentItem.storeName, response, modelPredicate.id('eq', clientSideId));
      // TODO update version for conflicts.
      this.persistQueueTo(transaction);
    } catch (error) {
      transaction.rollback();
    }
  }

  private clearQueueById(id: string) {
    const newItems = [];
    for (const item of this.items) {
      if (item.variables.data.id !== id) {
        newItems.push(item);
      }
    }
    this.items = newItems;
    this.persistQueueTo();
  }
}
