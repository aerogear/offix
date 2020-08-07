/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";
import { MutationsReplicationQueue } from "../src/replication/mutations/MutationsQueue";
import { LocalStorage, CRUDEvents } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";
import { WebNetworkStatus } from "../src/network/WebNetworkStatus";
import { CombinedError } from "urql";
import { metadataModel, queueModel } from "../src/replication/api/MetadataModels";
import { ModelSchema } from "../src";
import { readFileSync } from "fs";

const DB_NAME = "test";
const STORE_NAME = "user_Test";
const jsonSchema = JSON.parse(readFileSync(`${__dirname}/schema.json`).toString());
const adapter = new IndexedDBStorageAdapter(DB_NAME, 1);
const storage = new LocalStorage(adapter);
const schema = new ModelSchema<any>(jsonSchema.Test);
const model = { getStoreName: () => STORE_NAME } as any;

const windowEvents: any = {};
window.addEventListener = jest.fn((event, cb) => {
    windowEvents[event] = cb;
});
const networkStatus = new WebNetworkStatus();
networkStatus.isOnline = jest.fn();

const fireNetworkOnline = () => {
    (networkStatus.isOnline as jest.Mock).mockResolvedValue(true);
    windowEvents.online();
};
const fireNetworkOffline = () => {
    (networkStatus.isOnline as jest.Mock).mockResolvedValue(false);
    windowEvents.offline();
};

const mockClienWithResponse = (response: Promise<any>, onMutation?: Function): any => {
    return {
        mutation: (...args: any[]) => {
            if (onMutation) onMutation(...args);
            return {
                toPromise: async () => {
                    if (await networkStatus.isOnline()) return response;
                    return Promise.reject(new CombinedError({
                        networkError: Error("something went wrong!")
                    }));
                }
            }
        }
    };
};
const buildQueue = (client: any) => {
    return new MutationsReplicationQueue({
        storage,
        model,
        client,
        networkStatus
    });
};
const dummyRequest = {
    eventType: CRUDEvents.ADD,
    version: 1,
    variables: { id: "2" },
    storeName: STORE_NAME,
    mutation: {} as any
};


beforeAll(async () => {
    adapter.addStore(schema);
    adapter.addStore(queueModel);
    adapter.addStore(metadataModel);
    await adapter.createStores();
});

// beforeEach(() => storage.remove(metadataModel.getName()));

test("Queue works when online", (done) => {
    const client = mockClienWithResponse(Promise.resolve({}), () => {
        networkStatus.isOnline().then((isOnline) => {
            expect(isOnline).toBe(true);
            done();
        });
    });
    const queue = buildQueue(client);

    queue.init().then(() => {
        fireNetworkOffline();
        queue.addMutationRequest(dummyRequest);
        fireNetworkOnline();
    });
});

test.skip("Update id after suscess response", (done) => {
    const client = mockClienWithResponse(
        Promise.resolve({ test: { id: 'server_id', name: 'test' } })
    );
    const queue = buildQueue(client);

    storage.save(STORE_NAME, { id: "client_id", name: "test" })
        .then((data) => {
            queue.init().then(() => {
                fireNetworkOnline();
                queue.addMutationRequest({
                    ...dummyRequest,
                    eventType: CRUDEvents.ADD,
                    variables: data
                });
            });
        });

    // TODO do this inside success event listener
    // const result = await storage.query(STORE_NAME);
    // expect(result[0].id).toEqual('server_id');
});
