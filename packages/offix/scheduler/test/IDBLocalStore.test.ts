import { IDBLocalStore } from "../src/store";
import "fake-indexeddb/auto";

let store: IDBLocalStore;

describe("Empty store tests", () => {

  beforeEach(() => {
    store = new IDBLocalStore("db", "store");
  });

  afterEach(async () => {
    await store.clear();
  });

  test("Key not in local store returns is undefined", async () => {
    const key = await store.getItem("key");
    expect(key).toBeUndefined();
  });

  test("Key is in local store keys array when setting key value pair", async () => {
    await store.setItem("key", "value");
    const keys = await store.keys();
    expect(keys).toContain("key");
  });

  test("Local store can accept multiple key value pairs", async () => {
    await store.setItem("key1", "value1");
    await store.setItem("key2", "value2");
    await store.setItem("key3", "value3");
    const keys = await store.keys();
    expect(keys).toEqual(expect.arrayContaining(["key1", "key2", "key3"]));
  });

});

describe("Populated store tests", () => {

  beforeEach(async () => {
    store = new IDBLocalStore("db", "store");
    await store.setItem("key", "value");
    await store.setItem("key1", "value1");
    await store.setItem("key2", "value2");
    await store.setItem("key3", "value3");
  });

  afterEach(async () => {
    await store.clear();
  });

  test("Local store can set and retrieve key value pair", async () => {
    const item = await store.getItem("key");
    expect(item).toEqual("value");
  });

  test("Local store can remove a single key-value pair", async () => {
    await store.removeItem("key");
    const keys = await store.keys();
    expect(keys).not.toContain("value");
  });

  test("Local store allows to update key value", async () => {
    await store.setItem("key", "bar");
    const value = await store.getItem("key");
    expect(value).toContain("bar");
  });

  test("Clearing offline store results in empty keys array", async () => {
    await store.clear();
    const keys = await store.keys();
    expect(keys).toEqual(expect.arrayContaining([]));
  });

});


