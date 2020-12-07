import { CRUDEvents, LocalStorage } from "./storage";
import { StoreChangeEvent } from "./storage";
import { ModelSchema } from "./ModelSchema";
import { PushStream, ObservablePushStream } from "./utils/PushStream";
import { Filter } from "./filters";
import { DeltaQueriesConfig, LiveUpdatesConfig, ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import invariant from "tiny-invariant";
import { ModelChangeReplication } from "./replication/mutations/MutationsQueue";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "./utils/logger";
import { buildGraphQLCRUDQueries } from "./replication";
import { buildGraphQLCRUDSubscriptions } from "./replication/subscriptions/buildGraphQLCRUDSubscriptions";
import { ReplicatorSubscriptions } from "./replication/subscriptions/ReplicatorSubscriptions";
import { ReplicatorQueries } from "./replication/queries/ReplicatorQueries";

const logger = createLogger("model");

/**
 * Options that describe model field
 */
export interface FieldOptions {
  /** GraphQL type */
  type: string;
  /** GraphQL key */
  key: string;
  // TODO
  format?: {};
}

const CLIENT_ID_PREFIX = "storeclient.";

/**
 * Defines the properties expected in the Fields object for a model
 */
export type Fields<T> = {
  [P in keyof T]: FieldOptions
};

/**
 * Model Config options
 */
export interface ModelConfig<T = unknown> {
  /**
   * Model name
   */
  name: string;

  /**
   * Model store name, defualts to `user_${name}`
   */
  storeName?: string;

  /**
   * Model fields
   */
  fields: Fields<T>;
}

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T = unknown> {
  public schema: ModelSchema<T>;
  public replicationConfig: ModelReplicationConfig | undefined;
  public replication?: ModelChangeReplication;
  public changeEventStream: PushStream<StoreChangeEvent>;
  private storage: LocalStorage;
  public queries: ReplicatorQueries;
  public subscriptionQueries: ReplicatorSubscriptions;

  constructor(
    schema: ModelSchema<T>,
    storage: LocalStorage,
    replicationConfig?: ModelReplicationConfig
  ) {
    this.changeEventStream = new ObservablePushStream();
    this.schema = schema;
    this.storage = storage;
    this.replicationConfig = replicationConfig;
    this.storage.addStore(this.schema);
    this.queries = buildGraphQLCRUDQueries(this);
    this.subscriptionQueries = buildGraphQLCRUDSubscriptions(this);
  }

  public getFields() {
    return this.schema.getFields();
  }

  public getName() {
    return this.schema.getName();
  }

  public getStoreName() {
    return this.schema.getStoreName();
  }

  public getSchema() {
    return this.schema;
  }

  public query(filter?: Filter<T>) {
    if (!filter) { return this.storage.query(this.schema.getStoreName()); }

    return this.storage.query(this.schema.getStoreName(), filter);
  }

  public queryById(id: string) {
    return this.storage.queryById(this.schema.getStoreName(), this.schema.getPrimaryKey(), id);
  }

  public async save(input: Partial<T>): Promise<T> {
    input = this.addPrimaryKeyIfNeeded(input);
    try {
      const data = await this.storage.save(this.schema.getStoreName(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.ADD, this.storage);
      const event = {
        eventType: CRUDEvents.ADD,
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Save changes (if it doesn't exist or update records with partial input
   *
   * @param input
   */
  public async saveOrUpdate(input: Partial<T>): Promise<T> {
    input = this.addPrimaryKeyIfNeeded(input);
    try {
      const data = await this.storage.saveOrUpdate(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.ADD, this.storage);
      const event = {
        eventType: CRUDEvents.ADD,
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update set of the objects by setting common values.
   *
   * @param input
   * @param filter
   */
  public async update(input: Partial<T>, filter?: Filter<T>) {
    invariant(filter, "filter needs to be provided for update");
    try {
      const data = await this.storage.update(this.schema.getStoreName(), input, filter);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.UPDATE, this.storage);
      const event = {
        eventType: CRUDEvents.UPDATE,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update object by detecting it's id and using rest of the fields that are being merged with the original object
   *
   * @param input
   */
  public async updateById(input: Partial<T>) {
    const primaryKey = this.schema.getPrimaryKey();
    invariant((input as any)[primaryKey], "Missing primary key for update");

    try {
      const data = await this.storage.updateById(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.UPDATE, this.storage);
      const event = {
        eventType: CRUDEvents.UPDATE,
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove any set of objects using filter
   *
   * @param filter
   */
  public async remove(filter: Filter<T>) {
    invariant(filter, "filter needs to be provided for deletion");
    try {
      const primaryKey = this.schema.getPrimaryKey();
      const data = await this.storage.remove(this.schema.getStoreName(), primaryKey, filter);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.DELETE, this.storage);
      const event = {
        eventType: CRUDEvents.DELETE,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove objects by it's id (using index)
   *
   * @param input object that needs to be removed
   * We need to pass entire object to ensure it's consistency (version)
   */
  public async removeById(input: any) {
    const primaryKey = this.schema.getPrimaryKey();
    invariant((input as any)[primaryKey], "Missing primary key for delete");

    try {
      const data = await this.storage.removeById(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.DELETE, this.storage);
      const event = {
        eventType: CRUDEvents.DELETE,
        // TODO Why array here?
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to **local** changes that happen in the model
   *
   * TODO add ability to filter subscriptions
   *
   * @param eventType - allows you to specify what event type you are interested in.
   * @param listener
   */
  public subscribe(listener: (event: StoreChangeEvent) => void, eventTypes?: CRUDEvents[]) {
    return this.changeEventStream.subscribe((event: StoreChangeEvent) => {
      listener(event);
    }, (event: StoreChangeEvent) => {
      if (eventTypes) {
        return eventTypes.includes(event.eventType);
      }
      return true;
    });
  }

  /**
   * Process remote changes
   *
   * @param result result from delta
   */
  public async processDeltaChanges(dataResult: any[], type?: CRUDEvents): Promise<void> {
    if (!dataResult || dataResult.length === 0) {
      logger("Delta processing: No changes");
      return;
    }

    const db = this.storage;
    const store = this.schema.getStoreName();
    const primaryKey = this.schema.getPrimaryKey();
    for (const item of dataResult) {
      // Remove GraphQL internal information
      delete item.__typename;
      let data;
      let eventType;
      if (item._deleted) {
        logger("Delta processing: deleting item");
        data = await await db.removeById(store, primaryKey, item);
        eventType = CRUDEvents.DELETE;
      } else {
        const exist = await db.queryById(store, primaryKey, item[primaryKey]);
        if (exist) {
          logger("Delta processing: updating item");
          eventType = CRUDEvents.UPDATE;
          data = await db.updateById(this.schema.getStoreName(), primaryKey, item);
        } else {
          logger("Delta processing: adding item");
          eventType = CRUDEvents.ADD;
          data = await db.save(this.schema.getStoreName(), item);
        }
        if (!data) {
          logger("Failed to update items in database");
          return;
        }
      }
      const event = {
        eventType,
        // TODO this should be non array
        data: [data]
      };
      this.changeEventStream.publish(event);
    }
  }

  /**
   * **Internal method**
   *
   * Process remote changes
   *
   * @param result result from subscription
   */
  public async processSubscriptionChanges(dataResult: any, type: CRUDEvents): Promise<void> {
    if (!dataResult) {
      logger("Subscription returned no result. If you see this something is wrong.");
      return;
    }
    try {
      // Remove GraphQL internal information
      delete dataResult.__typename;
      logger("Retrieved object from subscription");
      const store = this.schema.getStoreName();
      const primaryKey = this.schema.getPrimaryKey();
      if (type === CRUDEvents.ADD) {
        await this.storage.save(this.schema.getStoreName(), dataResult);
      }

      if (type === CRUDEvents.UPDATE) {
        await this.storage.updateById(this.schema.getStoreName(), primaryKey, dataResult);
      }

      if (type === CRUDEvents.DELETE) {
        await await this.storage.removeById(store, primaryKey, dataResult);
      }
      const event = {
        eventType: type,
        // TODO this should be non array
        data: [dataResult]
      };
      this.changeEventStream.publish(event);

    } catch (error) {
      logger("Error when processing subscription" + JSON.stringify(error));
    }
  }

  /**
   * Late binding method for adding replication filters
   * after Model setup.
   *
   * i.e. setting a user filter after user login
   *
   * @param filter to be applied to replication config
   */
  public applyReplicationFilter(filter: Filter) {
    if (!this.replicationConfig) {
      return;
    }

    const deltaConfig = this.replicationConfig?.delta as DeltaQueriesConfig;
    const liveConfig = this.replicationConfig?.liveupdates as LiveUpdatesConfig;

    this.queries = buildGraphQLCRUDQueries(this);
    this.subscriptionQueries = buildGraphQLCRUDSubscriptions(this);

    this.replicationConfig = {
      ...this.replicationConfig,
      delta: {
        ...deltaConfig,
        filter
      },
      liveupdates: {
        ...liveConfig,
        filter
      }
    };
  }

  public startReplication() {

  }

  public stopReplication() {

  }

  /**
   * Checks if model has client side id.
   * Usually this means that model was not replicated and id from the server was not assigned.
   */
  public hasClientID() {
    return this.schema.getPrimaryKey().startsWith(CLIENT_ID_PREFIX);
  }

  private addPrimaryKeyIfNeeded(input: any) {
    const primaryKey = this.schema.getPrimaryKey();
    if (!input[primaryKey]) {
      input[primaryKey] = CLIENT_ID_PREFIX + uuidv4();
    }
    return input;
  }
}

