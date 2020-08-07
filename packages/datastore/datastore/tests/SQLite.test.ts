/**
 * @jest-environment jsdom
 */
import { WebSQLAdapter } from "../src/storage/adapters/WebSQLAdapter";
import { ModelSchema } from "../src/ModelSchema";
import { readFileSync } from "fs";
import { LocalStorage } from "../src";

// @ts-ignore
// eslint-disable-next-line
const openDatabase = require("websql");

let db: any;
let model: ModelSchema<any>;
let adapter: WebSQLAdapter;
let storage: LocalStorage;

const schema = JSON.parse(readFileSync(`${__dirname}/schema.json`).toString());

window.openDatabase = (name: string, version: string, description: string, size: number, callback: any) => {
  db = openDatabase(":memory:", version, description, size, callback);
  return db;
};

const setupTest = async () => {
  adapter = new WebSQLAdapter("offixdb", 1);
  storage = new LocalStorage(adapter);
  model = new ModelSchema<any>(schema.Test);
  storage.adapter.addStore(model);
  await adapter.createStores();
};

const removeStore = async () => {
}

describe("sqlite test suite", () => {

  afterAll(() => {
    db.close();
  });

  test.skip("it should create a store", async () => {
    await setupTest();
    // @ts-ignore private method
    const stores = await storage.adapter.getStoreNames();
    expect(stores).toContain(model.getStoreName());
  });

  test.skip("it should create a store ii", async () => {
    // @ts-ignore private method
    const stores = await storage.adapter.getStoreNames();
    expect(stores).toContain(model.getStoreName());
  });
});
