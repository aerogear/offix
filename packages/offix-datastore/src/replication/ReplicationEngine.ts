import { OffixScheduler } from "offix-scheduler";

import { IReplicator } from "./Replicator";
import { Storage, StoreChangeEvent } from "../storage";

/**
 * Schedules replication events and handles replication errors
 */
export class ReplicationEngine {
    private api: IReplicator;
    private scheduler: Promise<OffixScheduler<StoreChangeEvent>>;
    private storage: Storage;

    constructor(
        api: IReplicator,
        storage: Storage
    ) {
        this.api = api;
        this.storage = storage;
        this.scheduler = new Promise((resolve, reject) => {
            const scheduler = new OffixScheduler<StoreChangeEvent>({
                executor: {
                    execute: async (event: StoreChangeEvent) => {
                        const result = await this.api.push(event);
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
            this.scheduler.then((scheduler) => scheduler.execute(event));
        });
    }
}
