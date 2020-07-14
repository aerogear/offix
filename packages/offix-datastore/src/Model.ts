import { Storage, StoreChangeEvent, DatabaseEvents } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { IReplicator } from "./replication";

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
  private getStorage: () => Storage;

  constructor(
    config: ModelConfig<T>,
    getStorage: () => Storage,
    replicator?: IReplicator
  ) {
    this.name = config.name;
    this.storeName = config.storeName || `user_${config.name}`;
    this.fields = config.fields;
    this.getStorage = getStorage;

    // Model has access to replicator so there is possibility of model specific replicator config
    // We can control Model specific replication here
    // TODO set default matcher
    if (replicator && config.matcher) {
      this.subscribeForServerEvents(replicator);
      // TODO this should be moved
      this.doDeltaSync(replicator, config.matcher, config.predicate);
    }
    // TODO remove ReplicationEngine
    // and push changes to replicator from change methods(CUD) here instead
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

  public save(input: T): Promise<T> {
    return this.getStorage().save(this.storeName, input);
  }

  public query(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.getStorage().query(this.storeName); }

    const modelPredicate = createPredicate(this.fields);
    const predicate = predicateFunction(modelPredicate);
    return this.getStorage().query(this.storeName, predicate);
  }

  public update(input: Partial<T>, predicateFunction?: Predicate<T>) {
    if (!predicateFunction) {
      return this.getStorage().update(this.storeName, input);
    }

    const modelPredicate = createPredicate(this.fields);
    const predicate = predicateFunction(modelPredicate);
    return this.getStorage().update(this.storeName, input, predicate);
  }

  public remove(predicateFunction?: Predicate<T>) {
    if (!predicateFunction) { return this.getStorage().remove(this.storeName); }

    const modelPredicate = createPredicate(this.fields);
    const predicate = predicateFunction(modelPredicate);
    return this.getStorage().remove(this.storeName, predicate);
  }

  // TODO add seed and reset - investigate.

  public on(eventType: DatabaseEvents, listener: (event: StoreChangeEvent) => void) {
    return this.getStorage()
      .storeChangeEventStream.subscribe((event) => {
        if (event.eventType !== eventType) { return; }
        listener(event);
      });
  }

  // TODO this method should be public
  // so we can then specify the type of subscription event
  // the replicator in this case should not be passed as a variable
  private subscribeForServerEvents(replicator: IReplicator) {
    // TODO replicator.subscribe
    // handle subscription events here
    // for now the 'new' subscription
    // item is hardcoded in
    return replicator.subscribe(this.getStoreName(), DatabaseEvents.ADD);
  }

  // TODO remove this from here and move to replicator
  private async doDeltaSync(replicator: IReplicator, matcher: (d: T) => Predicate<T>, predicate?: Predicate<T>) {
    // TODO limit the size of data returned
    // TODO get lastSync for model for metadata store and pass to pullDelta
    const data = await replicator.pullDelta(this.getStoreName(), "", predicate);
    if (data.errors) {
      // TODO handle errors;
      // eslint-disable-next-line no-console
      console.log(data.errors);
    }

    // TODO this code makes no sense!
    // Trigers replication mutation event for data that is already on server
    if (data.data) {
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

    }

    // TODO replicator.pullDelta should return lastSync and write to metadata store for model
    // TODO consider removing older data if local db surpasses size limit
  }
}
