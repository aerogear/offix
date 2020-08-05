/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";
import { MutationsReplicationQueue } from "../src/replication/mutations/MutationsQueue";
import { LocalStorage, CRUDEvents } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";
import { WebNetworkStatus } from "../src/network/WebNetworkStatus";
import { MUTATION_QUEUE } from "../src/replication";
import { CombinedError } from "urql";

const DB_NAME = "test";
const STORE_NAME = "test";
const adapter = new IndexedDBStorageAdapter();
const storage = new LocalStorage(adapter);
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

const mockClienWithResponse = (response: Promise<any>): any => {
    return {
        mutation: jest.fn(() => {
            return {
                toPromise: async () => {
                    if (await networkStatus.isOnline()) return response;
                    return Promise.reject(new CombinedError({
                        networkError: Error('something went wrong!'),
                    }));
                }
            }
        })
    };
};

beforeAll(async () => {
    adapter.addStore({ name: MUTATION_QUEUE });
    adapter.addStore({ name: STORE_NAME });
    await adapter.createStores(DB_NAME, 1);
});

test("Queue works when online and stops when offline", async () => {
    const client = mockClienWithResponse(Promise.resolve({}));
    const clientWatch = client.mutation as jest.Mock;
    const queue = new MutationsReplicationQueue({
        storage,
        model,
        client,
        networkStatus,
    });

    await queue.init();
    const request = {
        eventType: CRUDEvents.ADD,
        version: 1,
        variables: { id: "2" },
        storeName: STORE_NAME,
        mutation: {} as any
    };

    fireNetworkOffline();
    queue.addMutationRequest(request);
    queue.addMutationRequest(request);
    expect(clientWatch).toHaveBeenCalledTimes(0);

    fireNetworkOnline();
    expect(clientWatch).toBeCalledTimes(2);
});
