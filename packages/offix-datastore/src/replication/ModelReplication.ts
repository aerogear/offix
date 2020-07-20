import { IReplicator, IModelReplicator, IOperation } from "./api/Replicator";
import { Predicate, createPredicate, PredicateFunction } from "../predicates";
import { LocalStorage, CRUDEvents } from "../storage";
import { ModelReplicationConfig } from "./api/ReplicationConfig";
import { NetworkStatus } from "../network/NetworkStatus";
import { buildGraphQLCRUDMutations } from "./mutations/buildGraphQLCRUDMutations";
import { buildGraphQLCRUDQueries } from ".";
import { buildGraphQLCRUDSubscriptions } from "./subscriptions/buildGraphQLCRUDSubscriptions";
import invariant from "tiny-invariant";
import { convertPredicateToFilter } from "./utils/convertPredicateToFilter";
import { DocumentNode, subscribe } from "graphql";
import Observable from "zen-observable";
import { pipe } from "wonka";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import { Model } from "../Model";


/**
 * Represents model replication object
 */
export class ModelReplication implements IModelReplicator {
  // TODO model replication interface should based on separate event stream to save data to store
  // rather than operate on the same storage interface as end users
  private storage: LocalStorage;
  private queue?: MutationsReplicationQueue;
  private model: Model;

  constructor(model: Model, storage: LocalStorage) {
    this.storage = storage;
    this.model = model;
  }
  public init(config: ModelReplicationConfig, networkInterface: NetworkStatus): void {
    if (config.mutations?.enabled) {
      const mutations = buildGraphQLCRUDMutations(this.model);
      this.queue = new MutationsReplicationQueue(this.storage);
      this.storage.storeChangeEventStream.subscribe((event) => {
        const { eventType, data, storeName, eventSource } = event;

        if (eventSource === "user" && this.model.getStoreName() === storeName) {
          this.queue.createMutationRequest({
            eventType, data, storeName
          });
        }
      });
    }

    if (config.delta?.enabled) {
      const queries = buildGraphQLCRUDQueries(model);
    }

    if (config.liveupdates?.enabled) {
      const subscriptionQueries = buildGraphQLCRUDSubscriptions(model);
    }
  }
  forceDeltaQuery<T>(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resetReplication<T>(config: ModelReplicationConfig<any>): void {
    throw new Error("Method not implemented.");
  }

  public push<T>(operation: IOperation) {
    const { storeName, input, eventType } = operation;
    const mutations = this.queries.get(storeName)?.mutations;
    logger(`${eventType} replication initialised`);
    invariant(mutations, `GraphQL Mutations not found for ${storeName}`);

    switch (eventType) {
      case CRUDEvents.ADD:
        return this.mutate<T>(mutations.create, { input });

      case CRUDEvents.UPDATE:
        return this.mutate<T>(mutations.update, { input });

      case CRUDEvents.DELETE:
        return this.mutate<T>(mutations.delete, { input });

      default:
        logger("Invalid store event received");
        throw new Error("Invalid store event received");
    }
  }

  public async pullDelta<T>(storeName: string, lastSync: string, predicate?: PredicateFunction) {
    const syncQuery = this.queries.get(storeName)?.queries.sync;
    invariant(syncQuery, `GraphQL Sync Queries not found for ${storeName}`);

    const variables: any = { lastSync };
    if (predicate) {
      variables.filter = convertPredicateToFilter(predicate);
    }
    return await this.query<T>(syncQuery, variables);
  }

  public subscribe<T>(storeName: string, eventType: CRUDEvents, predicate?: PredicateFunction) {
    const subscriptions = this.queries.get(storeName)?.subscriptions;
    invariant(subscriptions, `GraphQL Sync Queries not found for ${storeName}`);

    const variables: any = {};
    if (predicate) {
      variables.filter = convertPredicateToFilter(predicate);
    }

    switch (eventType) {
      case CRUDEvents.ADD:
        return this.observe<T>(subscriptions.new, variables);
      case CRUDEvents.UPDATE:
        return this.observe<T>(subscriptions.updated, variables);
      case CRUDEvents.DELETE:
        return this.observe<T>(subscriptions.deleted, variables);
      default:
        throw new Error("Invalid subscription type received");
    }
  }

  async query<T>(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.query(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  async mutate<T>(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.mutation(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  public observe<T>(query: string | DocumentNode, variables?: any) {
    return new Observable<T>(observer => {
      pipe(
        this.client.subscription(query, variables),
        subscribe(result => {
          if (result.error) {
            observer.error(result.error);
          }
          if (result?.data) {
            observer.next(result.data);
          }
        })
      );
    });
  }

  // TODO remove this from here and move to replicator
  private async doDeltaSync(replicator: IReplicator, matcher: (d: T) => Predicate<T>, predicate?: Predicate<T>) {
    // TODO limit the size of data returned
    const lastSync = (await this.readMetadata())?.lastSync || "";
    // const modelPredicate = createPredicate(this.fields);
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
    // TODO we need to save model keys to detect if change was detected
    // Separate metadata store for model itself
    this.storage.adapter.save(this.metadataName, { name, lastSync: "" });
  }
}


// // TODO remove this from here and move to replicator
  // private async doDeltaSync(replicator: IReplicator, matcher: (d: T) => Predicate<T>, predicate?: Predicate<T>) {
  //   // TODO limit the size of data returned
  //   const lastSync = (await this.readMetadata())?.lastSync || "";
  //   const modelPredicate = createPredicate(this.schema.getFields());
  //   const data = await replicator.pullDelta(
  //     this.storeName,
  //     lastSync,
  //     (predicate ? predicate(modelPredicate) : undefined)
  //   );
  //   if (data.errors) {
  //     // TODO handle errors;
  //     // eslint-disable-next-line no-console
  //     console.log(data.errors);
  //   }

  //   // TODO this code makes no sense!
  //   // Trigers replication mutation event for data that is already on server
  //   if (data.data && data.data.length > 0) {
  //     data.data
  //       .filter((d: any) => (d._deleted))
  //       .forEach((d: any) => {
  //         this.storage.remove(this.storeName,
  //           (predicate ? predicate(modelPredicate) : undefined), "replication");
  //       });

  //     data.data
  //       .filter((d: any) => (!d._deleted))
  //       .forEach((d: any) => {
  //         (async () => {
  //           const results = await this.storage.update(this.storeName, d, undefined, "replication");
  //           if (results.length === 0) {
  //             // no update was made, save the data instead
  //             await this.storage.save(this.storeName, d, "replication");
  //             return;
  //           }
  //         })();
  //       });
  //   } else {
  //     console.info("No data returned by delta query");
  //   }

  //   // TODO replicator.pullDelta should return lastSync and write to metadata store for model
  //   // TODO consider removing older data if local db surpasses size limit
  // }

  // /**
  //  * @returns metadata for this model or undefined is none exists
  //  */
  // private async readMetadata(): Promise<any | undefined> {
  //   const p = createPredicate({
  //     name: { type: "string", key: "name" },
  //     lastSync: { type: "string", key: "lastSync" }
  //   });
  //   const result = await this.storage.query(this.metadataName, p.name("eq", this.schema.getName()));
  //   if (result.length === 0) { return undefined; }
  //   return result[0];
  // }

  // /**
  //  * Add an entry to the metadata store if there is none
  //  * i.e if this is the first use of the model
  //  */
  // private async saveInitialMetadata() {
  //   const result = await this.readMetadata();
  //   if (result) { return; }
  //   this.storage.adapter.save(this.metadataName, { name: this.schema.getName(), lastSync: "" });
  // }


