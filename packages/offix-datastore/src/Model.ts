import { CRUDEvents, LocalStorage } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { StoreChangeEvent } from "./storage";
import { ModelSchema } from "./ModelSchema";
import { ModelReplicationConfig } from "./replication/api/ReplicationConfig";
import { IModelReplicator, IReplicator } from "./replication";

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
  private storage: LocalStorage;
  public schema: ModelSchema<T>;
  public replicationConfig?: ModelReplicationConfig;
  public replicator?: IModelReplicator;

  constructor(
    schema: ModelSchema<T>,
    storage: LocalStorage,
  ) {
    this.schema = schema;
    this.storage = storage;
    // TODO set primary keys here or thru api
    this.storage.addStore({ name:  this.schema.getStoreName()});
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

  public save(input: T): Promise<T> {
    return this.storage.save(this.schema.getStoreName(), input);
  }

  public query(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.storage.query(this.schema.getStoreName()); }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.query(this.schema.getStoreName(), predicate);
  }

  public update(input: Partial<T>, predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      // TODO Identify ID
      return this.storage.update(this.schema.getStoreName(), input);
    }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.update(this.schema.getStoreName(), input, predicate);
  }

  public remove(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      // TODO indentify and pass id directly
      return this.storage.remove(this.schema.getStoreName());
    }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.remove(this.schema.getStoreName(), predicate);
  }

  public subscribe(eventType: CRUDEvents, listener: (event: StoreChangeEvent) => void) {
    return this.storage
      .storeChangeEventStream.subscribe((event: StoreChangeEvent) => {
        if (event.eventType !== eventType) { return; }
        listener(event);
      });
  }

  /**
   * Setup custom overrides for the model replication system
   *
   * @param replicationConfig replication configuration for individual model
   */
  public setupReplication(replicationConfig: ModelReplicationConfig) {
    this.replicationConfig = replicationConfig;
  }

  /**
   * __Internal__ replicator setup
   */
  public setReplicator(replicator: IModelReplicator) {
    this.replicator = replicator;
  }
}
