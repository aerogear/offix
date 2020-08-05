import { CRUDEvents, LocalStorage } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { StoreChangeEvent } from "./storage";
import { ModelSchema } from "./ModelSchema";
import { IModelReplicator } from "./replication";
import { PushStream, ObservablePushStream } from "./utils/PushStream";

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
  public replicator?: IModelReplicator;
  private storage: LocalStorage;
  private changeEventStream: PushStream<StoreChangeEvent>;

  constructor(
    schema: ModelSchema<T>,
    storage: LocalStorage
  ) {
    this.changeEventStream = new ObservablePushStream();
    this.schema = schema;
    this.storage = storage;
    // TODO set primary keys here or thru api
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

  public async save(input: T): Promise<T> {
    const data = await this.storage.save(this.schema.getStoreName(), input);
    this.replicator?.replicate(data, CRUDEvents.ADD);
    this.changeEventStream.publish({
      eventType: CRUDEvents.ADD,
      data,
      storeName: this.getStoreName(),
      eventSource: "user"
    });
    return data;
  }

  public query(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.storage.query(this.schema.getStoreName()); }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.query(this.schema.getStoreName(), predicate);
  }

  public async update(input: Partial<T>, predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      // TODO Identify ID
      return this.storage.update(this.schema.getStoreName(), input);
    }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    const data = await this.storage.update(this.schema.getStoreName(), input, predicate);
    this.replicator?.replicate(data, CRUDEvents.UPDATE);
    this.changeEventStream.publish({
      eventType: CRUDEvents.UPDATE,
      data,
      storeName: this.getStoreName(),
      eventSource: "user"
    });
    return data;
  }

  public async remove(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      // TODO indentify and pass id directly
      return this.storage.remove(this.schema.getStoreName());
    }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    const data = await this.storage.remove(this.schema.getStoreName(), predicate);
    this.replicator?.replicate(data, CRUDEvents.DELETE);
    this.changeEventStream.publish({
      eventType: CRUDEvents.DELETE,
      data,
      storeName: this.getStoreName(),
      eventSource: "user"
    });
    return data;
  }

  public subscribe(eventType: CRUDEvents, listener: (event: StoreChangeEvent) => void) {
    return this.changeEventStream.subscribe((event: StoreChangeEvent) => {
        listener(event);
      }, (event: StoreChangeEvent) => (event.eventType === eventType));
  }

  /**
   * __Internal__ replicator setup
   */
  public setReplicator(replicator: IModelReplicator) {
    this.replicator = replicator;
  }
}
