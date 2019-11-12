import {
  createDefaultOfflineStorage,
  OfflineStore,
  PersistentStore,
  PersistedData
} from "../src/store";
import { QueueEntryOperation } from "../src/queue";
import { Store } from "idb-localstorage";
import "fake-indexeddb/auto";

const storage = createDefaultOfflineStorage() as Store;

const mockSerializer = {
  serializeForStorage: (entry: QueueEntryOperation<any>) => {
    return entry.op;
  },
  deserializeFromStorage: (persistedEntry: PersistedData) => {
    return persistedEntry;
  }
};

// clear the indexedDB store after each test
afterEach(async () => {
  await storage.clear();
});

it("smoke test of OfflineStore.init", async () => {
  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, mockSerializer);
  await offlineStore.init();

  const offlineData = await offlineStore.getOfflineData();
  expect(offlineData).toEqual([]);
});

it("offlineStore.saveEntry stores data", async () => {
  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, mockSerializer);
  await offlineStore.init();

  const entry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "123"
  };

  await offlineStore.saveEntry(entry);

  const offlineData = await offlineStore.getOfflineData();
  expect(offlineData.length).toBe(1);
  expect(offlineData[0].operation).toEqual(entry);
});

it("offlineStore.removeEntry removes data", async () => {
  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, mockSerializer);
  await offlineStore.init();

  const entry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "123"
  };

  await offlineStore.saveEntry(entry);

  let offlineData = await offlineStore.getOfflineData();
  expect(offlineData.length).toBe(1);
  expect(offlineData[0].operation).toEqual(entry);

  await offlineStore.removeEntry(entry);
  offlineData = await offlineStore.getOfflineData();
  expect(offlineData.length).toBe(0);
});

it("offlineStore returns data that was previously persisted already", async () => {

  const offlineMetaKey = "offline-meta-data";

  const existingEntry = {
    op: {
      foo: "bar"
    },
    qid: "1"
  };

  const existingEntryKey = "v1:1";

  // insert an entry directly into the storage layer before the offline store is initialized
  await storage.setItem(offlineMetaKey, [existingEntryKey]);
  await storage.setItem(existingEntryKey, existingEntry.op);

  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, mockSerializer);
  await offlineStore.init();

  const newEntry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "2"
  };

  await offlineStore.saveEntry(newEntry);

  // however we only get 1 valid item back
  const offlineData = await offlineStore.getOfflineData();
  expect(offlineData.length).toBe(2);
  expect(offlineData[0].operation).toEqual(existingEntry);
  expect(offlineData[1].operation).toEqual(newEntry);
});

it("offlineStore.getOfflineData does not return data inserted by different versions of the OfflineStore", async () => {

  const offlineMetaKey = "offline-meta-data";
  const invalidVersion = "v0:client:123";

  // insert an entry directly into the storage layer that uses a version key
  // the OfflineStore does not accept
  await storage.setItem(offlineMetaKey, [invalidVersion]);
  await storage.setItem(invalidVersion, {
    op: {
      foo: "bar"
    },
    qid: "111"
  });

  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, mockSerializer);
  await offlineStore.init();

  const entry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "123"
  };

  await offlineStore.saveEntry(entry);

  // there are 2 items in the storage layer
  const offlineKeys = await storage.getItem(offlineMetaKey) as string[];
  expect(offlineKeys.length).toBe(2);

  // however we only get 1 valid item back
  const offlineData = await offlineStore.getOfflineData();
  expect(offlineData.length).toBe(1);
  expect(offlineData[0].operation).toEqual(entry);
});

it("offlineStore.getOfflineData throws when deserialize throws", async () => {

  const badSerializer = {
    serializeForStorage: (_: QueueEntryOperation<any>) => {
      return _;
    },
    deserializeFromStorage: (_: PersistedData) => {
      throw new Error("error in deserialize");
    }
  };

  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, badSerializer);
  await offlineStore.init();

  const entry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "123"
  };

  await offlineStore.saveEntry(entry);

  await expect(offlineStore.getOfflineData()).rejects.toThrow("error in deserialize");
});

it("offlineStore.saveEntry throws when serialize throws", async () => {

  const badSerializer = {
    serializeForStorage: (_: QueueEntryOperation<any>) => {
      throw new Error("error in serialize");
    },
    deserializeFromStorage: (_: PersistedData) => {
      return _;
    }
  };

  const offlineStore = new OfflineStore(storage as PersistentStore<PersistedData>, badSerializer);
  await offlineStore.init();

  const entry: QueueEntryOperation<any> = {
    op: {
      hello: "world"
    },
    qid: "123"
  };

  await expect(offlineStore.saveEntry(entry)).rejects.toThrow("error in serialize");
});
