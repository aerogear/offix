/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";

import { ReplicationEngine } from "../src/replication";
import { Model } from "../src/Model";
import { LocalStorage, CRUDEvents } from "../src/storage";

const DB_NAME = "offix-datastore";
const storeName = "user_Test";
let storage: LocalStorage;
const testFields = {
  id: {
    type: "ID",
    key: "id"
  },
  name: {
    type: "String",
    key: "name"
  }
};
const testMatcher = (d: any) => (p: any) => p.id("eq", d.id);

beforeAll(() => {
  storage = new LocalStorage(DB_NAME, [
    new Model({ name: "Test", fields: {} }, () => (null as any))
  ], 1);
});

afterEach(() => {
  storage.storeChangeEventStream.clearSubscriptions();
});

test("Push ADD operation data to server", (done) => {
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

  const engine = new ReplicationEngine(api, storage);
  engine.start();
  storage.save(storeName, { title: "test" });
});

test("Push UPDATE operation data to server", (done) => {
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

  storage.save(storeName, { title: "test" })
    .then((r) => {
      const engine = new ReplicationEngine(api, storage);
      engine.start();
      storage.update(storeName, { title: "test update" });
    });
});

test("Pull and save new data from server", (done) => {
  const expectedPayload: any[] = [{ id: "Yay", name: "Test" }];
  const replicator: any = {
    pullDelta: () => {
      return Promise.resolve({ data: expectedPayload });
    }
  };

  const testModel = new Model<any>({
    name: "Test",
    fields: testFields,
    predicate: (p) => (p.name("eq", "Test")),
    matcher: testMatcher
  }, () => (storage), replicator);

  testModel.on(CRUDEvents.ADD, (event) => {
    expect(event.data.id).toEqual(expectedPayload[0].id);
    expect(event.data.name).toEqual(expectedPayload[0].name);
    done();
  });
});

test("Pull and merge update from server", (done) => {
  const expectedPayload: any[] = [{ name: "New Name" }];
  const replicator: any = {
    pullDelta: () => {
      return Promise.resolve({ data: expectedPayload });
    }
  };

  storage.save("user_Test", { name: "Old Name" })
    .then((saved) => {
      expectedPayload[0].id = saved.id;

      const testModel = new Model<any>({
        name: "Test",
        fields: testFields,
        predicate: (p) => (p.name("eq", "Test")),
        matcher: testMatcher
      }, () => (storage), replicator);

      testModel.on(CRUDEvents.UPDATE, (event) => {
        expect(event.data).toEqual(expectedPayload);
        done();
      });
    });
});

test("Pull and apply soft deletes from server", (done) => {
  const expectedPayload: any[] = [{ name: "Old Name" }];
  const replicator: any = {
    pullDelta: () => {
      return Promise.resolve({ data: [{ ...expectedPayload[0], _deleted: true }] });
    }
  };

  storage.save("user_Test", { name: "Old Name" })
    .then((saved) => {
      expectedPayload[0].id = saved.id;

      const testModel = new Model<any>({
        name: "Test",
        fields: testFields,
        predicate: (p) => (p.name("eq", "Test")),
        matcher: testMatcher
      }, () => (storage), replicator);

      testModel.on(CRUDEvents.DELETE, (event) => {
        expect(event.data).toEqual(expectedPayload);
        done();
      });
    });
});


test.todo("Subscribe to change events on server");
