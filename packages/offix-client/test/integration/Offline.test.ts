import { createClient } from "../../types";
import { createOptimisticResponse, CacheOperation } from "offix-cache";
import { TestStore } from "../utils/testStore";
import { ToggleableNetworkStatus } from "../utils/network";
import server from "../utils/server";
import { ADD_TASK, GET_TASKS, UPDATE_TASK, DELETE_TASK } from "../utils/graphql.queries";

function wait(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time) ;
  });
}

// TODO: error handling when server is down

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const offlineMetaKey = "offline-meta-data";

const newClient = async (clientOptions = {}) => {
  const config = {
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    ...clientOptions
  };

  return await createClient(config);
};

describe("Offline mutations", function() {

  this.timeout(20000);

  const mutationsQueueName = "offline-mutation-queue";

  const newTask = {
    description: "new",
    title: "new",
    version: 1,
    author: "new"
  };

  const optimisticOptions = {
    mutation: ADD_TASK,
    operationType: CacheOperation.ADD,
    returnType: "Task",
    variables: newTask,
    updateQuery: GET_TASKS
  };

  const updatedTask = {
    description: "updated",
    title: "updated"
  };

  before("start server", async function() {
    await server.start();
  });

  after("stop server", async function() {
    await server.stop();
  });

  beforeEach("reset server", async function() {
    await server.reset();
  });

  async function isQueueEmpty() {
    const store = await store.getItem(offlineMetaKey);
    return store.length === 0;
  }

  describe("offline mutations", function() {

    it("mutations are queued when offline", async function() {

      const client = await newClient({
        networkStatus: newNetworkStatus(false),
        storage: new TestStore()
      });

      const mutationOptions = {
        mutation: ADD_TASK,
        variables: newTask
      };
      await client.offlineMutate(mutationOptions).catch(err => {
        // ignore
      });

      const queue = client.queue.queue;
      expect(queue.length).toBe(1);
      const op = queue[0].operation.op;
      expect(op.mutation).toEqual(mutationOptions.mutation);
      expect(op.variables).toEqual(mutationOptions.variables);
    });

    it("mutations are persisted while offline", async function() {

      const client = await newClient({
        networkStatus: newNetworkStatus(false),
        storage: new TestStore()
      });

      const mutationOptions = {
        mutation: ADD_TASK,
        variables: newTask
      };

      await client.offlineMutate(mutationOptions).catch(err => {
        // ignore
      });

      const store = client.queue.store;
      const storeData = await store.getOfflineData();

      expect(storeData.length).toBe(1);

      const op = storeData[0].operation.op;
      expect(op.mutation).toEqual(mutationOptions.mutation);
      expect(op.variables).toEqual(mutationOptions.variables);
    });

    it("offlineMutate throws an offline error, we can get result when coming back online", async function(done) {

      const client = await newClient({
        networkStatus: newNetworkStatus(false),
        storage: new TestStore()
      });

      client.offlineMutate({
        mutation: ADD_TASK,
        variables: newTask
      }).catch((err) => {
        const promise = err.offlineMutatePromise;
        networkStatus.setOnline(true);  // go online
        promise.then((response) => {
          expect(response.data.createTask).toBeDefined();
          expect(response.data.createTask.title).toBe(newTask.title);
          expect(response.data.createTask.description).toBe(newTask.description);
          done();
        });
      });
    });

    it("queues multiple mutations while offline", async function() {
      const networkStatus = newNetworkStatus(true);

      const client = await newClient({
        networkStatus,
        storage: new TestStore()
      });

      const response = await client.offlineMutate({
        mutation: ADD_TASK,
        variables: newTask
      });

      const task = response.data.createTask;

      networkStatus.setOnline(false);

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) {
        // ingore
      }

      try {
        await client.offlineMutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) {
        // ignore
      }

      const queue = client.queue.queue;
      expect(queue.length).toBe(2);
      expect(queue[0].operation.op.context.operationName).toBe("updateTask");
      expect(queue[1].operation.op.context.operationName).toBe("deleteTask");
    });

    it("Handles multiple mutations on the same object in queue/store", async function() {
      const networkStatus = newNetworkStatus(true);

      const client = await newClient({
        networkStatus,
        storage: new TestStore()
      });

      const result = await client.mutate({
        mutation: ADD_TASK,
        variables: newTask
      });

      networkStatus.setOnline(false);

      const task = result.data.createTask;
      const variables = { ...task, ...updatedTask };

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) {
        // ignore
      }
      try {
        await client.offlineMutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) {
        // ignore
      }

      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: "network-only"
      });

      expect(response.data.allTasks).toBeDefined();
      expect(response.data.allTasks.length).toBe(0);
    });

    it("can create new items and subsequently mutate them while offline, async function ()", async () => {
      const networkStatus = newNetworkStatus(false);

      const client = await newClient({
        networkStatus,
        storage: new TestStore()
      });

      let task;
      const optimisticResponse = createOptimisticResponse(optimisticOptions);
      try {
        await client.offlineMutate({
          mutation: ADD_TASK,
          variables: newTask,
          optimisticResponse,
          update: (_, { data: { createTask } }) => task = createTask
        });
      } catch (ignore) {
        // ignore
      }

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });

      } catch (ignore) {
        // ignore
       }
      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: "network-only"
      });
      expect(response.data.allTasks).toBeDefined();
      expect(response.data.allTasks.length).toBe(1);
      expect(response.data.allTasks[0].title).toBe(updatedTask.title);
    });

    it("reinitialized client will replay operations from the offline storage (simulates an app restart)", async function() {
      let networkStatus = newNetworkStatus(false);
      const store = new TestStore();

      const client = await newClient({
        networkStatus,
        storage: store
      });

      let task;
      try {
        await client.offlineMutate({
          mutation: ADD_TASK,
          variables: newTask,
          optimisticResponse: createOptimisticResponse(optimisticOptions),
          update: (_, { data: { createTask } }) => task = createTask
        });
      } catch (ignore) {
        // ignore
      }

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) {
        // ignore
       }

      networkStatus = newNetworkStatus();
      client = await newClient({ networkStatus, storage: store, mutationsQueueName });

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: "network-only"
      });

      expect(response.data.allTasks).toBeDefined();
      expect(response.data.allTasks.length).toBe(1);
      expect(response.data.allTasks[0].title).toBe(updatedTask.title);
    });

    it("it can handle multiple offline mutations on an existing object and replay them successfully", async function() {

      const networkStatus = newNetworkStatus(true);
      const store = new TestStore();

      const client = await newClient({
        networkStatus,
        storage: store
      });

      const result = await client.offlineMutate({
        mutation: ADD_TASK,
        variables: newTask,
        returnType: "Task",
        optimisticResponse: createOptimisticResponse(optimisticOptions)
      });

      const task = result.data.createTask;

      networkStatus.setOnline(false);

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: "update1", description: "merge", id: task.id, version: task.version }
        });
      } catch (err) {
        // ignore
       }

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: "update2", description: "merge", id: task.id, version: task.version }
        });
      } catch (err) {
        // ignore
      }

      networkStatus.setOnline(true);

      await wait(1000);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: "network-only"
      });

      expect(response.data.allTasks).toBeDefined();
      expect(response.data.allTasks.length).toBe(1);
      expect(response.data.allTasks[0].title).toBe("update2");
    });

  });

  describe("do not merge offline mutations", async function() {

    it("should succeed", async function() {
      let task;
      const networkStatus = newNetworkStatus(false);
      const store = new TestStore();

      const client = await newClient({
        networkStatus,
        storage: store
      });

      networkStatus.setOnline(true);

      let response = await client.offlineMutate({
        mutation: ADD_TASK,
        variables: newTask,
        optimisticResponse: createOptimisticResponse(optimisticOptions)
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: "nomerge1", description: "nomerge", id: task.id, version: task.version }
        });
      } catch (ignore) {
        // ignore
      }

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: "nomerge2", description: "nomerge", id: task.id, version: task.version }
        });
      } catch (ignore) {
        // ignore
       }

      const offlineData = await client.queue.store.getOfflineData();

      expect(offlineData.length).toBe(2);

      expect(offlineData[0]).toBeDefined();
      expect(offlineData[1]).toBeDefined();
      expect(offlineData[0].operation.op.variables.title).toBe("nomerge1");
      expect(offlineData[1].operation.op.variables.title).toBe("nomerge2");

      networkStatus.setOnline(true);

      await wait(300);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: "network-only"
      });

      expect(response.data.allTasks).toBeDefined();
      expect(response.data.allTasks.length).toBe(1);
      expect(response.data.allTasks[0].title).toBe("nomerge2");
    });
  });

  describe("ensure offline params are added to offline object ", function() {

    it("should succeed", async function() {
      let task;
      const networkStatus = newNetworkStatus(false);
      const store = new TestStore();

      const client = await newClient({
        networkStatus,
        storage: store
      });
      networkStatus.setOnline(true);

      const response = await client.offlineMutate({
        mutation: ADD_TASK,
        variables: newTask,
        optimisticResponse: createOptimisticResponse(optimisticOptions)
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);

      const variables = { title: "nomerge1", description: "nomerge", id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables,
          idField: "someOtherField",
          returnType: "ADifferentType"
        });
      } catch (ignore) {
        // ignore
       }

      const offlineData = await client.queue.store.getOfflineData();
      const op = offlineData[0].operation.op;
      expect(op.context.returnType).toBe("ADifferentType");
      expect(op.context.idField).toBe("someOtherField");
    });
  });

  describe("notify about offline changes", function() {
    it("should succeed", async function() {
      const networkStatus = newNetworkStatus(false);
      const store = new TestStore();

      let offlineOps = 0;
      let cleared = 0;

      const listener = {
        onOperationEnqueued: () => offlineOps++,
        queueCleared: () => cleared++
      };

      const client = await newClient({
        networkStatus,
        storage: store,
        offlineQueueListener: listener
      });

      try {
        await client.offlineMutate({
          mutation: ADD_TASK,
          variables: newTask
        });
      } catch (ignore) {
        // ignore
       }

      expect(offlineOps).toBe(1);

      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(cleared).toBe(1);
    });
  });
});
