
import { MutationRequest } from "./MutationRequest";
import { LocalStorage, CRUDEvents } from "../../storage";
import { createLogger } from "../../utils/logger";
import { Client, OperationResult, CombinedError } from "urql";
import { NetworkStatusEvent } from "../../network/NetworkStatus";
import { Model } from "../../Model";
import { mutationQueueModel } from "../api/MetadataModels";
import { NetworkIndicator } from "../../network/NetworkIndicator";
import { ReplicatorMutations } from "./ReplicatorMutations";
import { GlobalReplicationConfig, MutationsConfig } from "../api/ReplicationConfig";
import { buildGraphQLCRUDMutations } from "./buildGraphQLCRUDMutations";
import invariant from "tiny-invariant";

const logger = createLogger("queue");

interface MutationReplicationOptions {
  storage: LocalStorage;
  client: Client;
  networkIndicator: NetworkIndicator;
}

/**
 * Interface that is injected into model in order to add new items to replication engine
 */
export interface ModelChangeReplication {
  /**
   * Save replication request
   * @param model
   * @param data
   * @param eventType
   * @param store
   */
  saveChangeForReplication(model: Model, data: any, eventType: CRUDEvents, store: LocalStorage): Promise<void>;
}
/**
 * Represents single row where we persist all items
 * We use single row to ensure consistency
 */
const MUTATION_ROW_ID = "offline_changes";

/**
 * Queue that manages replication of the mutations for all local edits.
 */
export class MutationsReplicationQueue implements ModelChangeReplication {
  // Map of the storeName to the GraphQL documents
  private modelMap: {
    [name: string]: { documents: ReplicatorMutations; model: Model };
  };
  // Queue is open (available to process data) if needed
  private open: boolean;
  // Queue is currently procesisng requests (used as semaphore to avoid processing multiple times)
  private processing: boolean;
  private options: MutationReplicationOptions;

  constructor(options: MutationReplicationOptions) {
    logger("Mutation queue created");
    this.options = options;
    this.open = false;
    this.processing = false;
    this.modelMap = {};
  }

  /**
   * Add models that should be replicated to the server
   *
   * @param models
   * @param globalConfig
   */
  public addModels(models: Model[], globalConfig: GlobalReplicationConfig) {
    for (const model of models) {
      let config: MutationsConfig | undefined = globalConfig.mutations;
      if (model.replicationConfig) {
        config = Object.assign({}, config, model.replicationConfig.mutations);
      }
      if (config?.enabled) {
        let documents;
        // Use Custom GraphQL queries
        if (globalConfig.documentBuilders?.mutations) {
          documents = globalConfig.documentBuilders?.mutations(model);
        } else {
          // Use GraphQLCRUD
          documents = buildGraphQLCRUDMutations(model);
        }
        // Save queries for model
        this.modelMap[`${model.getStoreName()}`] = { documents, model };

        // Enable replication for this model
        model.replication = this;
      }
    }
  }

  /**
   * Initialize networkstatus and Queue to make sure that it is in proper state after startup.
   */
  public init(models: Model[], globalConfig: GlobalReplicationConfig) {
    this.addModels(models, globalConfig);
    // Subscribe to network updates and open and close replication
    this.options.networkIndicator.subscribe({
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

    // Intentionally async to start replication in background
    this.options.networkIndicator.isNetworkReachable().then((result) => {
      if (this.open === result) {
        // No state change
        return;
      }

      if (result === true) {
        // Going online
        this.process();
      }
      this.open = result;
    });
  }

  /**
   * Save user change to bereplicated by engine
   */
  public async saveChangeForReplication(model: Model, data: any, eventType: CRUDEvents, store: LocalStorage) {
    // Actual graphql queries need to be persisted at the time of request creation
    // This will ensure consistency for situations when model changed (without migrating queue)
    const storeName = model.getStoreName();
    const operations = this.modelMap[storeName];
    invariant(!operations, "Missing GraphQL mutations for replication");

    const mutationRequest = {
      storeName,
      data,
      eventType
    };
    await this.enqueueRequest(mutationRequest);
    logger("Saved Queue. Preparing to process");
    this.process();
  }

  public async process() {
    if (!this.open) {
      logger("Client offline. Stop processsing queue");
      return;
    }

    if (this.processing) {
      logger("Client is processing already. Stop processsing queue");
      return;
    }

    this.processing = true;
    while (this.open) {
      const items = await this.options.storage.query(mutationQueueModel.getStoreName(), { id: MUTATION_ROW_ID });
      if (!items || items?.items.length > 0) {
        logger("Queue is empty");
        break;
      }

      const item: MutationRequest = items.items[0];
      logger("Mutation queue processing - online");
      invariant(!this.modelMap[item.storeName], `Store is not setup for replication ${item.storeName}`);

      const mutation = this.getMutationDocument(item);
      try {
        const result = await this.options.client.mutation(mutation, { input: item.data }).toPromise();
        logger(`Mutation result ${result}`);
        await this.resultProcessor(item, result);
        await this.dequeueRequest();
        logger("Mutation dequeued");
      } catch (error) {
        const retry = this.errorHandler(error, item);
        if (!retry) {
          await this.dequeueRequest();
        }
        // TODO invalidate any other changes that happened here
      }
    }
    this.processing = false;
    // Work finished we can close queue
    this.open = false;
  }

  private getMutationDocument({ storeName, eventType }: MutationRequest) {
    let mutationDocument;
    if (CRUDEvents.ADD === eventType) {
      mutationDocument = this.modelMap[storeName].documents.create;
    } else if (CRUDEvents.UPDATE === eventType) {
      mutationDocument = this.modelMap[storeName].documents.update;
    } else if (CRUDEvents.DELETE === eventType) {
      mutationDocument = this.modelMap[storeName].documents.delete;
    } else {
      logger("Invalid store event received");
      throw new Error("Invalid store event received");
    }
    return mutationDocument;
  }

  private async dequeueRequest() {
    const storeName = mutationQueueModel.getStoreName();
    const queue = await this.options.storage.query(storeName, { id: MUTATION_ROW_ID });
    if (queue?.items instanceof Array) {
      queue.items.shift();
    }
    this.options.storage.save(storeName, { id: MUTATION_ROW_ID, queue });
  }


  private async enqueueRequest(mutationRequest: MutationRequest) {
    let items = await this.options.storage.query(mutationQueueModel.getStoreName(), { id: MUTATION_ROW_ID });
    if (items?.items) {
      items.push(mutationRequest);
    }
    else {
      items = [mutationRequest];
    }
    this.options.storage.save(mutationQueueModel.getStoreName(), { id: MUTATION_ROW_ID, items });
  }

  /**
   * Handler for mutation error
   * @param error
   */
  private errorHandler(error: CombinedError, request: MutationRequest) {
    logger("error happend when processing request", error);
    const model = this.modelMap[request.storeName].model;
    const userErrorHandler = model.replicationConfig?.mutations?.errorHandler;
    if (userErrorHandler) {
      logger("error handled by user");
      return userErrorHandler(error.networkError, error.graphQLErrors);
    }

    if (error.networkError !== undefined && error.graphQLErrors === undefined) {
      logger("Error replied due to network error");
      return true;
    }

    return false;
  }

  // TODO not finished
  private async resultProcessor(currentItem: MutationRequest, data: OperationResult<any>) {
    const model = this.modelMap[currentItem.storeName].model;
    const primaryKey = model.schema.getPrimaryKey();
    const response = data.data[Object.keys(data.data)[0]];
    if (response) {
      // model.update(response, { [primaryKey]: response[primaryKey] })
    }
    const clientSideId = currentItem.data[primaryKey];
    if (clientSideId) {
      if (currentItem.eventType === CRUDEvents.ADD) {
        // TODO update id's of the elements in the queue
      }
    }
  }
}
