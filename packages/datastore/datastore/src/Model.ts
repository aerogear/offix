import { CRUDEvents, LocalStorage } from "./storage";
import { StoreChangeEvent } from "./storage";
import { ModelSchema } from "./ModelSchema";
import { PushStream, ObservablePushStream } from "./utils/PushStream";
import { Filter } from "./filters";
import { ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import invariant from "tiny-invariant";
import { ModelChangeReplication } from "./replication/mutations/MutationsQueue";

export interface FieldOptions {
  /** GraphQL type */
  type: string;
  /** GraphQL key */
  key: string;
  // TODO
  format?: {};
}

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
    return this.storage.queryById(this.schema.getStoreName(), id);
  }

  public async save(input: Partial<T>): Promise<T> {
    const db = await this.storage.createTransaction();
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

  public async updateById(input: Partial<T>, id: string) {
    const db = await this.storage.createTransaction();
    try {
      const data = await db.updateById(this.schema.getStoreName(), input, id);
      await this.replication?.saveChangeForReplication(this, [data], CRUDEvents.UPDATE, db);
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

  public async removeById(id: string) {
    const db = await this.storage.createTransaction();
    try {
      const data = await db.removeById(this.schema.getStoreName(), id);
      await this.replication?.saveChangeForReplication(this, [data], CRUDEvents.DELETE, db);
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

  public subscribe(eventType: CRUDEvents, listener: (event: StoreChangeEvent) => void) {
    return this.changeEventStream.subscribe((event: StoreChangeEvent) => {
      listener(event);
    }, (event: StoreChangeEvent) => (event.eventType === eventType));
  }
}
