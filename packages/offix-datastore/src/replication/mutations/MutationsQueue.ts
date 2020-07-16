
import { MutationRequest } from "./MutationRequest";
import { CRUDEvents, StoreChangeEvent, StorageAdapter } from "../../storage";
import { IReplicator } from "..";

/**
 * Queue that manages replication of the mutations for all local edits.
 */
export class MutationsReplicationQueue {

  private items: MutationRequest[];
  private started: boolean;
  private storage: StorageAdapter;
  private api: IReplicator;
  private queueName = "mutation_replication_queue";

  constructor(storage: StorageAdapter, api: IReplicator) {
    this.started = false;
    this.items = [];
    this.storage = storage;
    this.api = api;
    storage.addStore({ name: this.queueName });
  }

  createMutationEvent(event: StoreChangeEvent) {
    const request = new MutationRequest(event);
    this.items.push(request);
    this.process();
  }

  public async start() {
    this.started = true;
    this.items = await this.storage.query(this.queueName);

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
      if (data instanceof Array) {
        for (const element of data) {
          await this.api.push({
            eventType, input: element, storeName
          });
        }
      }
      // TODO save after finished replication
      await this.storage.save(this.queueName, this.items);
    }
  }
}
