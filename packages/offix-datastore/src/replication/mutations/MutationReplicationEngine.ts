
import { IReplicator } from "../api/Replicator";
import { LocalStorage } from "../../storage";
import { MutationsReplicationQueue } from "./MutationsQueue";
import { createLogger } from "../../utils/logger";

const logger = createLogger("engine");
/**
 * Schedules replication events and handles replication errors
 */
export class MutationReplicationEngine {

  private storage: LocalStorage;

  constructor(
    api: IReplicator,
    storage: LocalStorage
  ) {
    logger("Replication engine initialized");

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
