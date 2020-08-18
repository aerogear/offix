import { CRUDEvents, LocalStorage } from "./storage";
import { StoreChangeEvent } from "./storage";
import { ModelSchema } from "./ModelSchema";
import { PushStream, ObservablePushStream } from "./utils/PushStream";
import { Filter } from "./filters";
import { ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import invariant from "tiny-invariant";
import { ModelChangeReplication } from "./replication/mutations/MutationsQueue";
import { v4 as uuidv4 } from "uuid";

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

const CLIENT_ID_PREFIX = "storeclient."

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
  private storage: LocalStorage;
  private changeEventStream: PushStream<StoreChangeEvent>;

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

  public query(filter?: Filter<T>) {
    if (!filter) { return this.storage.query(this.schema.getStoreName()); }

    return this.storage.query(this.schema.getStoreName(), filter);
  }

  public queryById(id: string) {
    return this.storage.queryById(this.schema.getStoreName(), this.schema.getPrimaryKey(), id);
  }

  public async save(input: Partial<T>): Promise<T> {
    const db = await this.storage.createTransaction();
    this.setupPrimaryKeyIfNeeded(input);
    try {
      const data = await db.save(this.schema.getStoreName(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.ADD, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.ADD,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
      throw error;
    }
  }


  /**
   * Save changes (if it doesn't exist or update records with partial input
   *
   * @param input
   */
  public async saveOrUpdate(input: Partial<T>): Promise<T> {
    const db = await this.storage.createTransaction();
    this.setupPrimaryKeyIfNeeded(input);
    try {
      const data = await db.saveOrUpdate(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.ADD, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.ADD,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
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
    const db = await this.storage.createTransaction();
    try {
      const data = await db.update(this.schema.getStoreName(), input, filter);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.UPDATE, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.UPDATE,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
      throw error;
    }
  }

  /**
   * Update object by detecting it's id and using rest of the fields that are being merged with the original object
   *
   * @param input
   */
  public async updateById(input: Partial<T>) {
    const db = await this.storage.createTransaction();
    try {
      const data = await db.updateById(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.UPDATE, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.UPDATE,
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
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

    const db = await this.storage.createTransaction();
    try {
      const data = await db.remove(this.schema.getStoreName(), filter);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.DELETE, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.DELETE,
        data
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
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
    const db = await this.storage.createTransaction();
    try {
      const data = await db.removeById(this.schema.getStoreName(), this.schema.getPrimaryKey(), input);
      await this.replication?.saveChangeForReplication(this, data, CRUDEvents.DELETE, db);
      await db.commit();
      const event = {
        eventType: CRUDEvents.DELETE,
        data: [data]
      };
      this.changeEventStream.publish(event);
      return data;
    } catch (error) {
      await db.rollback();
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
  public subscribe(listener: (event: StoreChangeEvent) => void, eventType?: CRUDEvents) {
    return this.changeEventStream.subscribe((event: StoreChangeEvent) => {
      listener(event);
    }, (event: StoreChangeEvent) => {
      if (eventType) {
        return event.eventType === eventType;
      }
      return true;
    });
  }

  /**
   * Checks if model has client side id.
   * Usually this means that model was not replicated and id from the server was not assigned.
   */
  public hasClientID() {
    return this.schema.getPrimaryKey().startsWith(CLIENT_ID_PREFIX);
  }

  private setupPrimaryKeyIfNeeded(input: any) {
    const primaryKey = this.schema.getPrimaryKey();
    if ((input[primaryKey]) === undefined) {
      input[primaryKey] = CLIENT_ID_PREFIX + uuidv4();
    }
  }

}

