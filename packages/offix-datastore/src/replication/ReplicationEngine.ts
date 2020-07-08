import { OffixScheduler } from "offix-scheduler";

import { IReplicator, IOperation } from "./Replicator";
import { Storage, DatabaseEvents } from "../storage";

/**
 * Schedules replication events and handles replication errors
 */
export class ReplicationEngine {
  private api: IReplicator;
  private scheduler: Promise<OffixScheduler<IOperation>>;
  private storage: Storage;

  constructor(
    api: IReplicator,
    storage: Storage
  ) {
    this.api = api;
    this.storage = storage;
    this.scheduler = new Promise((resolve, reject) => {
      const scheduler = new OffixScheduler<IOperation>({
        executor: {
          execute: async (operation: IOperation) => {
            const result = await this.api.push(operation);
            if (result.errors.length > 0) {
              // TODO handle errors
            }
          }
        }
      });
      scheduler.init()
        .then(() => resolve(scheduler))
        .catch((err) => reject(err));
    });
  }

  public start() {
    this.storage.storeChangeEventStream.subscribe((event) => {
      const { eventType, data, storeName } = event;

      if (eventType === DatabaseEvents.ADD) {
        this.scheduler.then((scheduler) => scheduler.execute({
          eventType, input: data, storeName
        }));
        return;
      }

      // updates and deletes are in batches
      (data as Array<any>).forEach((input) => {
        this.scheduler.then((scheduler) => scheduler.execute({
          eventType, input, storeName
        }));
      });
    });
  }
}
