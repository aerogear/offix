/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { MutationReplicationEngine } from "../src/replication";
import { Model } from "../src/Model";
import { LocalStorage, CRUDEvents } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/IndexedDBStorageAdapter";
import { Fields, ModelSchema } from "../src/ModelSchema";

const DB_NAME = "offix-datastore";
const storeName = "user_Test";
let storage: LocalStorage;
const testFields: Fields<any> = {
  id: {
    type: "string",
    key: "id"
  },
  name: {
    type: "string",
    key: "name"
  }
};
// const testMatcher = (d: any) => (p: any) => p.id("eq", d.id);
const metadataName = "metadata";

beforeAll(() => {
  const adapter = new IndexedDBStorageAdapter();
  adapter.addStore({ name: storeName });
  adapter.addStore({ name: metadataName });
  adapter.addStore({ name: "mutation_replication_queue" });
  storage = new LocalStorage(adapter);
  adapter.createStores(DB_NAME, 1);
});

describe("Test Push operations", () => {
  test.skip("Push ADD operation data to server", (done: any) => {
    const api: any = {
      push: (op: any) => {
        expect(op.eventType).toEqual(CRUDEvents.ADD);
        expect(op.input).toHaveProperty("title", "test");
        done();
        return Promise.resolve({
          data: null,
          errors: []
        });
      }
    };

    const engine = new MutationReplicationEngine(api, storage);
    engine.start();
    storage.save(storeName, { title: "test" });
  });

  test.skip("Push UPDATE operation data to server", (done: any) => {
    const api: any = {
      push: (op: any) => {
        expect(op.eventType).toEqual(CRUDEvents.UPDATE);
        expect(op.input).toHaveProperty("id");
        expect(op.input).toHaveProperty("title", "test update");
        done();
        return Promise.resolve({
          data: null,
          errors: []
        });
      }
    };

    const engine = new MutationReplicationEngine(api, storage);
    storage.save(storeName, { title: "test" })
      .then((r) => {
        engine.start();
        storage.update(storeName, { title: "test update" });
      });
  });

});

describe("Test Pull operations", () => {
  afterEach(() => {
    storage.storeChangeEventStream.clearSubscriptions();
  });


  test.skip("Pull and save new data from server", (done) => {
    const expectedPayload: any[] = [{ id: "Yay", name: "Test" }];
    const replicator: any = {
      pullDelta: () => {
        return Promise.resolve({ data: expectedPayload });
      }
    };
    const schema: ModelSchema<any> = new ModelSchema({
      name: "Test",
      type: "object",
      properties: testFields
    });
    const testModel = new Model<any>(schema, storage, metadataName, replicator);

    testModel.on(CRUDEvents.ADD, (event) => {
      expect(event.data.id).toEqual(expectedPayload[0].id);
      expect(event.data.name).toEqual(expectedPayload[0].name);
      done();
    });
  });

  test.skip("Pull and merge update from server", (done) => {
    const expectedPayload: any[] = [{ name: "New Name" }];
    const replicator: any = {
      pullDelta: () => {
        return Promise.resolve({ data: expectedPayload });
      }
    };

    storage.save("user_Test", { name: "Old Name" })
      .then((saved) => {
        expectedPayload[0].id = saved.id;
        const schema = new ModelSchema({
          name: "Test",
          type: "object",
          properties: testFields
        });
        const testModel = new Model<any>(schema, storage, metadataName, replicator);
        testModel.on(CRUDEvents.UPDATE, (event) => {
          expect(event.data).toEqual(expectedPayload);
          done();
        });
      });
  });

  test.skip("Pull and apply soft deletes from server", (done) => {
    const expectedPayload: any[] = [{ name: "Old Name" }];
    const replicator: any = {
      pullDelta: () => {
        return Promise.resolve({ data: [{ ...expectedPayload[0], _deleted: true }] });
      }
    };

    storage.save("user_Test", { name: "Old Name" })
      .then((saved) => {
        expectedPayload[0].id = saved.id;
        const schema = new ModelSchema({
          name: "Test",
          type: "object",
          properties: testFields
        });
        const testModel = new Model<any>(schema, storage, metadataName, replicator);
        testModel.on(CRUDEvents.DELETE, (event) => {
          expect(event.data).toEqual(expectedPayload);
          done();
        });
      });
  });

});

test.todo("Subscribe to change events on server");
