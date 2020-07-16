import { CRUDEvents, LocalStorage } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { IReplicator } from "./replication";
import { StoreChangeEvent } from "./storage";

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

  /**
   * Delta Query and Subscription filter
   */
  predicate?: Predicate<T>;

  /**
   * Associate server version of entities with local version.
   * It returns a predicate used to determine which entities
   * get changed given the data from the server
   *
   * @param data is the version from the server
   */
  matcher?: (data: T) => Predicate<T>;
}

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T = unknown> {
  private name: string;
  private storeName: string;
  private fields: Fields<T>;
  private storage: LocalStorage;
  private replicator: IReplicator | undefined;
  private metadataName: string;

  constructor(
    config: ModelConfig<T>,
    storage: LocalStorage,
    metadataName: string,
    replicator?: IReplicator
  ) {
    this.name = config.name;
    this.storeName = config.storeName || `user_${config.name}`;
    this.fields = config.fields;
    this.storage = storage;
    this.metadataName = metadataName;
    // TODO set custom primary keys
    this.storage.adapter.addStore({ name: this.storeName });
    this.saveInitialMetadata();

    // TODO set default matcher
    if (replicator && config.matcher) {
      // TODO this should be moved
      this.doDeltaSync(replicator, config.matcher, config.predicate);
    }
  }

  public getFields() {
    return this.fields;
  }

  public getName() {
    return this.name;
  }

  public getStoreName() {
    return this.storeName;
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

    const modelPredicate = createPredicate(this.fields);
    const predicate = predicateFunction(modelPredicate);
    return this.storage.query(this.storeName, predicate);
  }

  public update(input: Partial<T>, predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      return this.storage.update(this.storeName, input);
    }

    const modelPredicate = createPredicate(this.fields);
    const predicate = predicateFunction(modelPredicate);
    return this.storage.update(this.storeName, input, predicate);
  }

  public remove(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.storage.remove(this.storeName); }

    const modelPredicate = createPredicate(this.fields);
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
    if (!this.replicator) {
      throw new Error("Replicator has not yet been set");
    }
    return this.replicator.subscribe(this.getStoreName(), eventType);
  }

  // TODO remove this from here and move to replicator
  private async doDeltaSync(replicator: IReplicator, matcher: (d: T) => Predicate<T>, predicate?: Predicate<T>) {
    // TODO limit the size of data returned
    const lastSync = (await this.readMetadata())?.lastSync || "";
    const modelPredicate = createPredicate(this.fields);
    const data = await replicator.pullDelta(
      this.getStoreName(),
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
        .forEach((d: any) => {
          this.storage.remove(this.storeName,
            (predicate ? predicate(modelPredicate) : undefined), "replication");
        });

      data.data
        .filter((d: any) => (!d._deleted))
        .forEach((d: any) => {
          (async () => {
            const results = await this.storage.update(this.storeName, d, undefined, "replication");
            if (results.length === 0) {
              // no update was made, save the data instead
              await this.storage.save(this.storeName, d, "replication");
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
      name: { type: "String", key: "name" },
      lastSync: { type: "String", key: "lastSync" }
    });
    const result = await this.storage.query(this.metadataName, p.name("eq", this.name));
    if (result.length === 0) { return undefined; }
    return result[0];
  }

  /**
   * Add an entry to the metadata store if there is none
   * i.e this is the first use of the model
   */
  private async saveInitialMetadata() {
    const result = await this.readMetadata();
    if (result) { return; }
    this.storage.adapter.save(this.metadataName, { name, lastSync: "" });
  }
}
