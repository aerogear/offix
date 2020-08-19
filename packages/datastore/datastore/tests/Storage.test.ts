import "fake-indexeddb/auto";

import { LocalStorage } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/indexedDB/IndexedDBStorageAdapter";
import { ModelSchema, ModelJsonSchema } from "../src/ModelSchema";

describe("Test Transactions", () => {
  let storage: LocalStorage;
  const name = "Test";
  const storeName = "user_Test";

  beforeAll(async () => {
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
    } as ModelJsonSchema<any>;
    const model = new ModelSchema<any>(schema);
    adapter.addStore(model);
    adapter.createStores();
    storage = new LocalStorage(adapter);

  });

  afterEach(async () => {
    await storage.deleteStore(storeName);
  });

  test("transaction commit", async () => {
    const transaction = await storage.createTransaction();
    await transaction.save(storeName, { id: "test", name: "test" });
    await transaction.commit();

    const results = await storage.query(storeName);
    expect(results.length).toEqual(1);
  });

  test("transaction rollback", async () => {
    const transaction = await storage.createTransaction();
    await transaction.save(storeName, { id: "test1", name: "test 1" });
    await transaction.save(storeName, { id: "test2", name: "test 2" });
    await transaction.save(storeName, { id: "test3", name: "test 3" });
    await transaction.rollback();

    const results = await storage.query(storeName);
    expect(results.length).toEqual(0);
  });
});
