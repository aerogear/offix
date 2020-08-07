import "fake-indexeddb/auto";

import { LocalStorage } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";
import { ModelSchema, DataSyncJsonSchema } from "../src/ModelSchema";

describe("Test Transactions", () => {
    let storage: LocalStorage;
    const name = "Test";
    const storeName = "user_Test";

    beforeAll(() => {
        const adapter = new IndexedDBStorageAdapter("test", 1);
        const schema = {
          name: name,
          type: "object",
          properties: {
            id: {
              type: "string",
              primary: true
            }
          }
        } as DataSyncJsonSchema<any>;
        const model = new ModelSchema<any>(schema);
        adapter.addStore(model);
        adapter.createStores();
        storage = new LocalStorage(adapter);
    });

    afterEach(async () => {
        await storage.remove(storeName);
    });

    test("transaction commit", async () => {
        const transaction = await storage.createTransaction();
        await transaction.save(storeName, { name: "test" });
        await transaction.commit();

        const results = await storage.query(storeName);
        expect(results.length).toEqual(1);
    });

    test("transaction rollback", async () => {
        const transaction = await storage.createTransaction();
        await transaction.save(storeName, { name: "test 1" });
        await transaction.save(storeName, { name: "test 2" });
        await transaction.save(storeName, { name: "test 3" });
        await transaction.rollback();

        const results = await storage.query(storeName);
        expect(results.length).toEqual(0);
    });
});
