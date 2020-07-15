
import { IReplicator } from "./api/Replicator";
import { LocalStorage, CRUDEvents } from "../storage";

/**
 * Schedules replication events and handles replication errors
 */
export class ReplicationEngine {
  private api: IReplicator;
  private storage: LocalStorage;

  constructor(
    api: IReplicator,
    storage: LocalStorage
  ) {
    this.api = api;
    this.storage = storage;
  }

  public start() {
    // TODO replication engine should be not based on the events itself.
    this.storage.storeChangeEventStream.subscribe((event) => {
      const { eventType, data, storeName } = event;


      // TODO transform operation into replication event
      if (eventType === CRUDEvents.ADD) {
        this.api.push({
          eventType, input: data, storeName
        });
      }

      if (typeof data.forEach !== "function") {
        // eslint-disable-next-line no-console
        console.log(data);
        this.api.push({
          eventType, input: data, storeName
        });
        return;
      }
      // TODO updates and deletes are in batches
      // TODO queue those changes
      (data as Array<any>).forEach((input) => {
        this.api.push({
          eventType, input, storeName
        });
      });
    });
  }
}
