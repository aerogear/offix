
import { IReplicator } from "./api/Replicator";
import { LocalStorage, CRUDEvents } from "../storage";
import { ReplicatorQueries } from "./api/Documents";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";

/**
 * Schedules replication events and handles replication errors
 */
export class MutationReplicationEngine {
  private queue: MutationsReplicationQueue;
  private storage: LocalStorage;

  constructor(
    api: IReplicator,
    storage: LocalStorage
  ) {
    this.queue = new MutationsReplicationQueue(storage)
    // TODO connect network interface/subscriotion status
    this.storage = storage;
    this.queue.start();
  }

  public start() {
    // TODO replication engine should be not based on the events itself.
    this.storage.storeChangeEventStream.subscribe((event) => {
      const { eventType, data, storeName, eventSource } = event;

      if(eventSource === "user"){
        this.queue.createMutationEvent({
          eventType, input: data, storeName
        });
      }
  }
}
