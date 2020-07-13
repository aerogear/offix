/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { ReplicationEngine, IReplicator } from "../src/replication";
import { Storage, DatabaseEvents } from "../src/storage";
import { Model } from "../src/Model";

const DB_NAME = "offix-datastore";
const storeName = "user_Note";
let storage: Storage;

beforeAll(() => {
  storage = new Storage(DB_NAME, [
    new Model({ name: "Test", fields: {} }, () => (null as any))
  ], 1);
});

test("Push ADD operation data to server", (done) => {
  const api: IReplicator = {
    push: (op) => {
      expect(op.eventType).toEqual(DatabaseEvents.ADD);
      expect(op.input).toHaveProperty("title", "test");
      done();
      return Promise.resolve({
        data: null,
        errors: [],
      })
    }
  };

  const engine = new ReplicationEngine(api, storage);
  engine.start();
  storage.save(storeName, { title: "test" });
});

test("Push UPDATE operation data to server", (done) => {
  const api: IReplicator = {
    push: (op) => {
      expect(op.eventType).toEqual(DatabaseEvents.UPDATE);
      expect(op.input).toHaveProperty("id");
      expect(op.input).toHaveProperty("title", "test update");
      done();
      return Promise.resolve({
        data: null,
        errors: [],
      })
    }
  };

  storage.save(storeName, { title: "test" })
    .then((r) => {
      const engine = new ReplicationEngine(api, storage);
      engine.start();
      storage.update(storeName, { title: "test update" });
    });
});

test.todo("Pull and merge delta from server");
