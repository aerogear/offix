import { ApolloOfflineClient } from '../../dist'
import { createOptimisticResponse, CacheOperation } from 'offix-cache';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { TestxDirector } from "graphql-testx/dist/src/TestxDirector"
import gql from 'graphql-tag';

function wait(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

// TODO: error handling when server is down

const TESTX_CONTROLLER_URL = "http://localhost:4002";

let server;
let httpUrl;

let FIND_ALL_TASKS;
let CREATE_TASK;
let UPDATE_TASK;
let DELETE_TASK = gql`
  mutation deleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const offlineMetaKey = "offline-meta-data";

const newClient = async (clientOptions = {}) => {
  const link = new HttpLink({ uri: httpUrl })
  const config = {
    link,
    cache: new InMemoryCache(),
    ...clientOptions
  };

  const client = new ApolloOfflineClient(config);
  await client.init()
  return client
};

describe('Offline mutations', function () {

  this.timeout(20000);

  const mutationsQueueName = 'offline-mutation-queue';

  const newTask = {
    description: 'new',
    title: 'new',
    version: 1,
    author: "new"
  };

  const newOptimisticResponse = () => {
    return createOptimisticResponse({
      mutation: CREATE_TASK,
      operationType: CacheOperation.ADD,
      returnType: "Task",
      variables: newTask,
      updateQuery: FIND_ALL_TASKS
    })
  }  

  const updatedTask = {
    description: 'updated',
    title: 'updated'
  };

  let client, networkStatus, store;

  before('start server', async function () {
    server = new TestxDirector(TESTX_CONTROLLER_URL)
    await server.start();

    httpUrl = await server.httpUrl();
    const queries = await server.getQueries();
    const mutations = await server.getMutations();

    FIND_ALL_TASKS = gql(queries.findAllTasks)
    CREATE_TASK = gql(mutations.createTask)
    UPDATE_TASK = gql(mutations.updateTask)
    // TODO: 
    // DELETE_TASK = gql(mutations.deleteTask)
  });

  after('stop server', async function () {
    await server.stop();
  });

  beforeEach('reset server', async function () {
    await server.cleanDatabase();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus(false);
    store = new TestStore();
    client = await newClient({ networkStatus, offlineStorage: store, mutationsQueueName });
  });

  async function isQueueEmpty() {
    const store = await store.getItem(offlineMetaKey);
    return store.length === 0
  }

  describe('offline mutations', function () {

    it('mutations are queued when offline', async function () {
      const mutationOptions = {
        mutation: CREATE_TASK,
        variables: newTask
      }
      await client.offlineMutate(mutationOptions).catch(err => { });

      const queue = client.queue.entries
      expect(queue.length).to.equal(1)
      const op = queue[0].operation.op
      expect(op.mutation).to.deep.equal(mutationOptions.mutation)
      expect(op.variables).to.deep.equal(mutationOptions.variables)
    });

    it('mutations are persisted while offline', async function () {
      const mutationOptions = {
        mutation: CREATE_TASK,
        variables: newTask
      }

      await client.offlineMutate(mutationOptions).catch(err => { })

      const store = client.queue.store
      const storeData = await store.getOfflineData()

      expect(storeData.length).to.equal(1);

      const op = storeData[0].operation.op
      expect(op.mutation).to.deep.equal(mutationOptions.mutation)
      expect(op.variables).to.deep.equal(mutationOptions.variables)
    });

    it('offlineMutate throws an offline error, we can get result when coming back online', function (done) {
      client.offlineMutate({
        mutation: CREATE_TASK,
        variables: newTask
      }).catch((err) => {
        const promise = err.offlineMutatePromise
        networkStatus.setOnline(true);  // go online
        promise.then((response) => {
          console.log('offline changes replicated', response)
          expect(response.data.createTask).to.exist;
          expect(response.data.createTask.title).to.equal(newTask.title);
          expect(response.data.createTask.description).to.equal(newTask.description);
          done()
        })
      })
    });

    it('queues multiple mutations while offline', async function () {
      networkStatus.setOnline(true);

      const response = await client.offlineMutate({
        mutation: CREATE_TASK,
        variables: newTask
      });

      let task = response.data.createTask;

      networkStatus.setOnline(false);

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      try {
        await client.offlineMutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) { }

      const queue = client.queue.entries
      expect(queue.length).to.equal(2)
      expect(queue[0].operation.op.context.operationName).to.equal('updateTask');
      expect(queue[1].operation.op.context.operationName).to.equal('deleteTask');
    });

    it('Handles multiple mutations on the same object in queue/store', async function () {
      this.timeout(0)
      networkStatus.setOnline(true);

      const result = await client.mutate({
        mutation: CREATE_TASK,
        variables: newTask
      })

      networkStatus.setOnline(false);

      const task = result.data.createTask;
      const variables = { ...task, ...updatedTask };

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }
      try {
        await client.offlineMutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) { }

      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(0);
    });

    it('can create new items and subsequently mutate them while offline, async function ()', async () => {
      let task;
      const optimisticResponse = newOptimisticResponse();
      try {
        await client.offlineMutate({
          mutation: CREATE_TASK,
          variables: newTask,
          optimisticResponse,
          update: (_, { data: { createTask } }) => task = createTask
        })
      } catch (ignore) { }

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });

      } catch (ignore) { }
      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      })
      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal(updatedTask.title);
    });

    it('reinitialized client will replay operations from the offline storage (simulates an app restart)', async function () {
      let task;
      try {
        await client.offlineMutate({
          mutation: CREATE_TASK,
          variables: newTask,
          optimisticResponse: newOptimisticResponse(),
          update: (_, { data: { createTask } }) => task = createTask
        });
      } catch (ignore) { }

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      networkStatus = newNetworkStatus();
      client = await newClient({ networkStatus, offlineStorage: store, mutationsQueueName });

      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal(updatedTask.title);
    });

    it('it can handle multiple offline mutations on an existing object and replay them successfully', async function () {
      networkStatus.setOnline(true);

      const result = await client.offlineMutate({
        mutation: CREATE_TASK,
        variables: newTask,
        returnType: "Task",
        optimisticResponse: newOptimisticResponse(),
      });

      let task = result.data.createTask;

      networkStatus.setOnline(false);

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: 'Task',
          variables: { title: 'update1', description: 'merge', id: task.id, version: task.version }
        });
      } catch (err) { }

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: 'Task',
          variables: { title: 'update2', description: 'merge', id: task.id, version: task.version }
        });
      } catch (err) { }

      networkStatus.setOnline(true);

      await wait(1000);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('update2');
    });

  })

  describe('do not merge offline mutations', function () {

    let task;

    beforeEach('prepare data', async function () {
      client = await newClient({ networkStatus, offlineStorage: store, mutationsQueueName });
      networkStatus.setOnline(true);

      const response = await client.offlineMutate({
        mutation: CREATE_TASK,
        variables: newTask,
        optimisticResponse: newOptimisticResponse(),
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function () {
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version }
        });
      } catch (ignore) { }

      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables: { title: 'nomerge2', description: 'nomerge', id: task.id, version: task.version }
        });
      } catch (ignore) { }

      const offlineData = await client.queue.store.getOfflineData()

      expect(offlineData.length).to.equal(2)


      expect(offlineData[0]).to.exist;
      expect(offlineData[1]).to.exist;
      expect(offlineData[0].operation.op.variables.title).to.equal('nomerge1');
      expect(offlineData[1].operation.op.variables.title).to.equal('nomerge2');

      networkStatus.setOnline(true);

      await wait(300);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('nomerge2');
    });
  });

  describe('ensure offline params are added to offline object ', function () {

    let task;

    beforeEach('prepare data', async function () {
      client = await newClient({ networkStatus, offlineStorage: store, mutationsQueueName });
      networkStatus.setOnline(true);

      const response = await client.offlineMutate({
        mutation: CREATE_TASK,
        variables: newTask,
        optimisticResponse: newOptimisticResponse(),
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function () {
      const variables = { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version };
      try {
        await client.offlineMutate({
          mutation: UPDATE_TASK,
          returnType: "Task",
          variables,
          idField: "someOtherField",
          returnType: "ADifferentType"
        });
      } catch (ignore) { }

      const offlineData = await client.queue.store.getOfflineData()
      const op = offlineData[0].operation.op
      expect(op.context.returnType).to.equal('ADifferentType');
      expect(op.context.idField).to.equal('someOtherField');
    });
  });

  describe('notify about offline changes', function () {
    it('should succeed', async function () {
      let offlineOps = 0;
      let cleared = 0;

      const listener = {
        onOperationEnqueued: () => offlineOps++,
        queueCleared: () => cleared++
      };

      client = await newClient({ networkStatus, offlineStorage: store, mutationsQueueName, offlineQueueListener: listener });
      try {
        await client.offlineMutate({
          mutation: CREATE_TASK,
          variables: newTask
        });
      } catch (ignore) { }

      expect(offlineOps).to.equal(1);

      networkStatus.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(cleared).to.equal(1);
    });
  });
});


