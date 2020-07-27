import { CRUDEvents, LocalStorage } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { IReplicator } from "./replication";
import { StoreChangeEvent } from "./storage";
import invariant from "tiny-invariant";
import { ModelSchema, DataSyncProperties } from "./ModelSchema";

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
  [P in keyof T]: DataSyncProperties
};

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T = unknown> {
  public schema: ModelSchema<T>;
  private storage: LocalStorage;
  private replicator: IReplicator | undefined;
  private metadataName: string;
  private storeName: string;

  constructor(
    schema: ModelSchema<T>,
    storage: LocalStorage,
    metadataName: string,
    replicator?: IReplicator
  ) {
    this.schema = schema;
    this.storeName = schema.getStoreName();
    this.storage = storage;
    this.metadataName = metadataName;
    // TODO set custom primary keys
    this.storage.adapter.addStore({ name: this.schema.getStoreName() });
    this.saveInitialMetadata();

  }

  // TODO refactor this so that this is not required
  // otherwise find a simpler solution
  public setReplicator(replicator: IReplicator) {
    this.replicator = replicator;
  }

  public save(input: T): Promise<T> {
    return this.storage.save(this.storeName, input);
  }

  public query(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.storage.query(this.storeName); }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.query(this.storeName, predicate);
  }

  public update(input: Partial<T>, predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      return this.storage.update(this.storeName, input);
    }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.update(this.storeName, input, predicate);
  }

  public remove(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.storage.remove(this.storeName); }

    const modelPredicate = createPredicate(this.schema.getFields());
    const predicate = predicateFunction(modelPredicate);
    return this.storage.remove(this.storeName, predicate);
  }

  // TODO add seed and reset - investigate.

  public on(eventType: CRUDEvents, listener: (event: StoreChangeEvent) => void) {
    return this.storage
      .storeChangeEventStream.subscribe((event: StoreChangeEvent) => {
        if (event.eventType !== eventType) { return; }
        listener(event);
      });
  }

  public subscribeForServerEvents(eventType: CRUDEvents, filter: any = {}) {
    invariant(this.replicator, "Replicator has not yet been set");
    return this.replicator.subscribe(this.storeName, eventType);
  }

  // TODO remove this from here and move to replicator
  private async doDeltaSync(replicator: IReplicator, matcher: (d: T) => Predicate<T>, predicate?: Predicate<T>) {
    // TODO limit the size of data returned
    const lastSync = (await this.readMetadata())?.lastSync || "";
    const modelPredicate = createPredicate(this.schema.getFields());
    const data = await replicator.pullDelta(
      this.storeName,
      lastSync,
      (predicate ? predicate(modelPredicate) : undefined)
    );
    if (data.errors) {
      // TODO handle errors;
      // eslint-disable-next-line no-console
      console.log(data.errors);
    }

    // TODO this code makes no sense!
    // Trigers replication mutation event for data that is already on server
    if (data.data && data.data.length > 0) {
      data.data
        .filter((d: any) => (d._deleted))
        .forEach((d: any) => { this.remove(matcher(d)); });
      data.data
        .filter((d: any) => (!d._deleted))
        .forEach((d: any) => {
          (async () => {
            const results = await this.update(d, matcher(d));
            if (results.length === 0) {
              // no update was made, save the data instead
              this.save(d);
              return;
            }
          })();
        });
    } else {
      console.info("No data returned by delta query");
    }

    // TODO replicator.pullDelta should return lastSync and write to metadata store for model
    // TODO consider removing older data if local db surpasses size limit
  }

  /**
   * @returns metadata for this model or undefined is none exists
   */
  private async readMetadata(): Promise<any | undefined> {
    const p = createPredicate({
      name: { type: "string", key: "name" },
      lastSync: { type: "string", key: "lastSync" }
    });
    const result = await this.storage.query(this.metadataName, p.name("eq", this.schema.getName()));
    if (result.length === 0) { return undefined; }
    return result[0];
  }

  /**
   * Add an entry to the metadata store if there is none
   * i.e if this is the first use of the model
   */
  private async saveInitialMetadata() {
    const result = await this.readMetadata();
    if (result) { return; }
    this.storage.adapter.save(this.metadataName, { name: this.schema.getName(), lastSync: "" });
  }
}
