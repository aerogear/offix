import "fake-indexeddb/auto";

import { LocalStorage } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";

describe("Test Transactions", () => {
    let storage: LocalStorage;
    const storeName = "Test";

    beforeAll(() => {
        const adapter = new IndexedDBStorageAdapter();
        adapter.addStore({ name: storeName });
        adapter.createStores("test", 1);
        storage = new LocalStorage(adapter);
    });

    afterEach(async () => {
        storage.storeChangeEventStream.finishSubscriptions();
        await storage.remove(storeName);
    });

    test("transaction commit", async () => {
        expect.assertions(2);

        storage.storeChangeEventStream.subscribe(event => {
            expect(event.data).toHaveProperty("name", "test");
        });

        const transaction = await storage.createTransaction();
        await transaction.save(storeName, { name: "test" });
        await transaction.commit();

        const results = await storage.query(storeName);
        expect(results.length).toEqual(1);
    });

    test("transaction rollback", async () => {
        storage.storeChangeEventStream.subscribe(() => {
            fail("No event should be fired");
        });

        const transaction = await storage.createTransaction();
        await transaction.save(storeName, { name: "test 1" });
        await transaction.save(storeName, { name: "test 2" });
        await transaction.save(storeName, { name: "test 3" });
        await transaction.rollback();

        const results = await storage.query(storeName);
        expect(results.length).toEqual(0);
    });
});
