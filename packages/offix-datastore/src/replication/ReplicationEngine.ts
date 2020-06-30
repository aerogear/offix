import { OffixScheduler } from "offix-scheduler";

import { IReplicationAPI } from "./ReplicationAPI";
import { Model } from "../Model";
import { Storage, StoreChangeEvent } from "../storage";

export class ReplicationEngine {
    private api: IReplicationAPI;
    /**
     * The time between syncs
     */
    private scheduler: Promise<OffixScheduler<StoreChangeEvent>>;
    private storage: Storage;

    constructor(
        api: IReplicationAPI,
        storage: Storage,
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
        this.storage.storeChangeEventStream.subscribe(async (event) => {
            (await this.scheduler).execute(event);
        });
    }
}
