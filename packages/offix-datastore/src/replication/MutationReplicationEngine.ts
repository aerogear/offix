
import { IReplicator } from "./api/Replicator";
import { LocalStorage } from "../storage";
import { MutationsReplicationQueue } from "./mutations/MutationsQueue";
import { createLogger } from "../utils/logger";

const logger = createLogger("engine");
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
    logger("Replication engine initialized");
    this.queue = new MutationsReplicationQueue(storage.adapter, api);
    // TODO connect network interface/subscriotion status
    this.queue.start();
    this.storage = storage;
  }

  public start() {
    logger("Replication engine started");
    // TODO replication engine should be not based on the events itself.
    this.storage.storeChangeEventStream.subscribe((event) => {
      const { eventType, data, storeName, eventSource } = event;

      if (eventSource === "user") {
        this.queue.createMutationEvent({
          eventType, data, storeName
        });
      }
    });
  }
}
