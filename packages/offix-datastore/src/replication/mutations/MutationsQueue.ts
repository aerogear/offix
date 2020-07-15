
import { MutationRequest } from "./MutationRequest";
import { CRUDEvents, StoreChangeEvent, LocalStorage } from "../../storage";
import { IReplicator } from "..";

/**
 * Queue that manages replication of the mutations for all local edits.
 */
export class MutationsReplicationQueue {

  private items: MutationRequest[];
  private started: boolean;
  private storage: LocalStorage;
  private api: IReplicator;
  private queueName = "mutation_replication_queue";

  constructor(storage: LocalStorage, api: IReplicator) {
    this.started = false;
    this.items = [];
    this.storage = storage;
    this.api = api;
  }

  createMutationEvent(event: StoreChangeEvent) {
    const request = new MutationRequest(event);
    this.items.push(request);
    this.process();
  }

  public async start() {
    this.items = await this.storage.readMetadata(this.queueName);

    if (this.started) {
      return;
    }
    this.process();
  }

  public stop() {
    this.started = false;
  }

  public async process() {
    if (!this.started) {
      return;
    }
    const item = this.items.shift();

    // TODO errors
    if (item) {
      const { eventType, data, storeName } = item?.event;
      // TODO transform operation into replication event
      if (eventType === CRUDEvents.ADD) {
        await this.api.push({
          eventType, input: data, storeName
        });
      }

      if (typeof data.forEach !== "function") {
        // eslint-disable-next-line no-console
        console.log(data);
        await this.api.push({
          eventType, input: data, storeName
        });
        return;
      }
      // TODO updates and deletes are in batches
      // TODO queue those changes
      (data as Array<any>).forEach((input) => {
        await this.api.push({
          eventType, input, storeName
        });
      });
      // TODO save after finished replication
      await this.storage.writeMetadata(this.queueName, this.items);
    }

  }
}
