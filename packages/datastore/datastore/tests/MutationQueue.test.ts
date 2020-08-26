/**
 * @jest-environment jsdom
 */

import "fake-indexeddb/auto";
import { MutationsReplicationQueue, getQueueUpdates } from "../src/replication/mutations/MutationsQueue";
import { LocalStorage, CRUDEvents } from "../src/storage";
import { IndexedDBStorageAdapter } from "../src/storage/adapters/indexedDB/IndexedDBStorageAdapter";
import { WebNetworkStatus } from "../src/replication/network/WebNetworkStatus";
import { CombinedError } from "urql";
import { metadataModel, mutationQueueModel } from "../src/replication/api/MetadataModels";
import { ModelSchema } from "../src";
import { readFileSync } from "fs";
import { NetworkIndicator } from "../src/replication/network/NetworkIndicator";
import { GlobalReplicationConfig } from "../src/replication/api/ReplicationConfig";
import { MutationRequest } from "../src/replication/mutations/MutationRequest";

const DB_NAME = "test";
const STORE_NAME = "user_Test";
const jsonSchema = JSON.parse(readFileSync(`${__dirname}/schema.json`).toString());
const adapter = new IndexedDBStorageAdapter(DB_NAME, 1);
const storage = new LocalStorage(adapter);
const schema = new ModelSchema<any>(jsonSchema.Test);
const model = { getStoreName: () => STORE_NAME } as any;
const ModelMap = {
  clientStore: {
    getSchema: () => ({ getPrimaryKey: () => "id" })
  }
};

const windowEvents: any = {};
window.addEventListener = jest.fn((event, cb) => {
  windowEvents[event] = cb;
});
const networkStatus = new WebNetworkStatus();
networkStatus.isOnline = jest.fn();
const networkIndicator = new NetworkIndicator(networkStatus);
networkIndicator.initialize();

const fireNetworkOnline = () => {
  (networkStatus.isOnline as jest.Mock).mockResolvedValue(true);
  windowEvents.online();
};
const fireNetworkOffline = () => {
  (networkStatus.isOnline as jest.Mock).mockResolvedValue(false);
  windowEvents.offline();
};

const mockClienWithResponse = (response: Promise<any>, onMutation?: Function): any => {
  return {
    mutation: (...args: any[]) => {
      if (onMutation) onMutation(...args);
      return {
        toPromise: async () => {
          if (await networkStatus.isOnline()) return response;
          return Promise.reject(new CombinedError({
            networkError: Error("something went wrong!")
          }));
        }
      }
    }
  };
};
const buildQueue = (client: any) => {
  return new MutationsReplicationQueue({
    storage,
    client,
    networkIndicator
  });
};
const dummyRequest = {
  eventType: CRUDEvents.ADD,
  variables: { id: "2" },
  storeName: STORE_NAME,
};


beforeAll(async () => {
  adapter.addStore(schema);
  adapter.addStore(mutationQueueModel);
  adapter.addStore(metadataModel);
  await adapter.createStores();
});

// beforeEach(() => storage.remove(metadataModel.getName()));

test("Queue is disabled when no config", async (done) => {
  const client = mockClienWithResponse(Promise.resolve({}), () => {
    networkStatus.isOnline().then((isOnline) => {
      expect(isOnline).toBe(true);
      done();
    });
  });
  const queue = buildQueue(client);
  queue.init([model], { mutations: { enabled: false } } as GlobalReplicationConfig);
  queue.process().then(done);
});

test.skip("Queue is enabled", (done) => {
  const client = mockClienWithResponse(Promise.resolve({}), () => {
    networkStatus.isOnline().then((isOnline) => {
      expect(isOnline).toBe(true);
      done();
    });
  });
  const queue = buildQueue(client);
  queue.init([model], { mutations: { enabled: true } } as GlobalReplicationConfig);
  storage.save(STORE_NAME, { id: "client_id", name: "test" }).then((value) => {
    queue.saveChangeForReplication(model, value, CRUDEvents.ADD, storage);
  })
})

test.skip("Update id after suscess response", (done) => {
  const client = mockClienWithResponse(
    Promise.resolve({ test: { id: 'server_id', name: 'test' } })
  );
  const queue = buildQueue(client);

  storage.save(STORE_NAME, { id: "client_id", name: "test" })
    .then((data) => {
      queue.init([model], { mutations: { enabled: true } } as GlobalReplicationConfig)

      fireNetworkOnline();
      queue.saveChangeForReplication(model, data, CRUDEvents.ADD, storage);
    });
});

test("Construct queue updates", () => {
  const items: MutationRequest[] = [
    {
      storeName: "clientStore",
      data: {
        id: "test",
        test: {
          test: ["client"]
        }
      },
      eventType: CRUDEvents.ADD
    }
  ];

  const result = getQueueUpdates(items, ModelMap, "client", "server", "id");
  expect(result[0].storeName).toEqual("clientStore");
  expect(result[0].update.test.test[0]).toEqual("server");
});

test("Only use latest change when constructing queue updates", () => {
  const items: MutationRequest[] = [
    {
      storeName: "clientStore",
      data: {
        id: "test",
        test: {
          test: ["client"]
        }
      },
      eventType: CRUDEvents.ADD
    },
    {
      storeName: "clientStore",
      data: {
        id: "test",
        test: {
          test: ["somethingelse"]
        }
      },
      eventType: CRUDEvents.UPDATE
    },
    {
      storeName: "clientStore",
      data: {
        id: "test",
        random: "a random field"
      },
      eventType: CRUDEvents.UPDATE
    }
  ];
  const result = getQueueUpdates(items, ModelMap, "client", "server", "id");
  expect(result[0].storeName).toEqual("clientStore");
  expect(result[0].update.test.test[0]).toEqual("somethingelse");
});

test("Remove queue update if it has been deleted", () => {
  const items: MutationRequest[] = [
    {
      storeName: "clientStore",
      data: {
        id: "test",
        test: {
          test: ["client"]
        }
      },
      eventType: CRUDEvents.ADD
    },
    {
      storeName: "clientStore",
      data: {
        id: "test"
      },
      eventType: CRUDEvents.DELETE
    }
  ];
  const result = getQueueUpdates(items, ModelMap, "client", "server", "id");
  expect(result.length).toEqual(0);
});
