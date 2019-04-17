import { createClient, createOptimisticResponse } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import waitFor from '../utils/waitFor';
import { ADD_TASK, GET_TASKS, UPDATE_TASK, DELETE_TASK, ONLINE_ONLY } from '../utils/graphql.queries';

// TODO: error handling when server is down

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const newClient = async (clientOptions = {}) => {
  const config = {
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    ...clientOptions
  };

  return await createClient(config);
};

describe('Offline mutations', function() {

  this.timeout(1000);

  const mutationsQueueName = 'offline-mutation-queue';

  const newTask = {
    description: 'new',
    title: 'new',
    version: 1
  };

  const updatedTask = {
    description: 'updated',
    title: 'updated'
  };

  let client, networkStatus, store;

  before('start server', async function() {
    await server.start();
  });

  after('stop server', async function() {
    await server.stop();
  });

  beforeEach('reset server', async function() {
    await server.reset();
  });

  beforeEach('create client', async function() {
    networkStatus = newNetworkStatus(false);
    store = new TestStore();
    client = await newClient({ networkStatus, storage: store, mutationsQueueName });
  });

  describe('save mutation to offlineMutationStore while offline', function() {

    it('should succeed', async function() {
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask
        });
      } catch (ignore) { }


      const offlineMutationStore = JSON.parse(store.getItem(mutationsQueueName));

      expect(offlineMutationStore).to.exist;
      expect(offlineMutationStore[0]).to.exist;
      expect(offlineMutationStore[0].operation).to.exist;
      expect(offlineMutationStore[0].operation.operationName).to.equal('createTask');
      expect(offlineMutationStore[0].operation.variables.title).to.equal(newTask.title);
      expect(offlineMutationStore[0].operation.variables.description).to.equal(newTask.description);
    });

  });

  describe('send mutation when going back online', function() {

    beforeEach('prepare data', async function() {
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask
        })
      } catch (ignore) {
      }

    });

    it('should succeed', async function() {
      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      const response = await client.query({
        query: GET_TASKS
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(newTask.title);
      expect(response.data.allTasks[0].description).to.equal(newTask.description);
    });

  });

  describe('save more mutations while offline', function() {

    let task;

    beforeEach('prepare data', async function() {
      networkStatus.setOnline(true);

      const response = await client.mutate({
        mutation: ADD_TASK,
        variables: newTask
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function() {
      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      try {
        await client.mutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) { }

      const offlineMutationStore = JSON.parse(store.getItem(mutationsQueueName));

      expect(offlineMutationStore).to.exist;
      expect(offlineMutationStore.length).to.equal(2);
      expect(offlineMutationStore.find(item => item.operation.operationName === 'updateTask')).to.exist;
      expect(offlineMutationStore.find(item => item.operation.operationName === 'deleteTask')).to.exist;
    });
  });

  describe('send more mutations when back online', function() {

    beforeEach('prepare data', async function() {
      networkStatus.setOnline(true);

      const response = await client.mutate({
        mutation: ADD_TASK,
        variables: newTask
      });

      networkStatus.setOnline(false);

      const task = response.data.createTask;
      const variables = { ...task, ...updatedTask };

      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }
      try {
        await client.mutate({
          mutation: DELETE_TASK,
          variables: { id: task.id }
        });
      } catch (ignore) { }
    });

    it('should succeed', async function() {
      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(0);
    });
  });

  describe('create then update item while offline', function() {
    it('should succeed', async function() {
      let task;
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask,
          optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
          update: (_, { data: { createTask } }) => task = createTask
        });
      } catch (ignore) { }

      const variables = { ...updatedTask, id: task.id, version: task.version };

      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
    });
  });

  describe('create then update item while offline then replaying mutations', function() {
    it('should succeed', async function() {
      let task;
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask,
          optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
          update: (_, { data: { createTask } }) => task = createTask
        });
      } catch (ignore) { }


      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }
      networkStatus = newNetworkStatus();
      client = await newClient({ networkStatus, storage: store, mutationsQueueName });

      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
    });
  });


  describe('replaying mutations with mutationCacheUpdates', function() {
    it('should succeed', async function() {
      let task;
      let updateMethod = (_, { data: { createTask } }) => task = createTask;
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask,
          optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
          update: updateMethod
        });
      } catch (ignore) { }

      const variables = { ...updatedTask, id: task.id, version: task.version };
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      networkStatus = newNetworkStatus();
      client = await newClient({
        mutationCacheUpdates: { updateTask: updateMethod }, networkStatus, storage: store, mutationsQueueName,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
    });
  });

  describe('queue offline mutations', function() {

    let task;

    beforeEach('prepare data', async function() {
      networkStatus.setOnline(true);

      const response = await client.mutate({
        mutation: ADD_TASK,
        variables: newTask,
        optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function() {
      const variables = { title: 'update1', description: 'merge', id: task.id, version: task.version };
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }
      const firstUpdateTitle = variables.title;

      variables.title = 'update2';
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      const offlineMutationStore = JSON.parse(store.getItem(mutationsQueueName));

      expect(offlineMutationStore.length).to.equal(2);
      expect(offlineMutationStore[0].operation.variables.title).to.equal(firstUpdateTitle);
      expect(offlineMutationStore[1].operation.variables.title).to.equal(variables.title);

      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(variables.title);
    });
  });

  describe('do not merge offline mutations', function() {

    let task;

    beforeEach('prepare data', async function() {
      client = await newClient({ networkStatus, storage: store, mutationsQueueName });
      networkStatus.setOnline(true);

      const response = await client.mutate({
        mutation: ADD_TASK,
        variables: newTask,
        optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function() {
      const variables = { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version };
      try {
        await client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      variables.title = 'nomerge2';
      try {
        client.mutate({
          mutation: UPDATE_TASK,
          variables
        });
      } catch (ignore) { }

      const offlineMutationStore = JSON.parse(store.getItem(mutationsQueueName));

      expect(offlineMutationStore.length).to.equal(2);
      expect(offlineMutationStore[0].operation.variables.title).to.equal('nomerge1');
      expect(offlineMutationStore[1].operation.variables.title).to.equal(variables.title);

      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(variables.title);
    });
  });

  describe('notify about offline changes', function() {
    it('should succeed', async function() {
      let offlineOps = 0;
      let cleared = 0;

      const listener = {
        onOperationEnqueued: () => offlineOps++,
        queueCleared: () => cleared++
      };

      client = await newClient({ networkStatus, storage: store, mutationsQueueName, offlineQueueListener: listener });
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask
        });
      } catch (ignore) { }

      expect(offlineOps).to.equal(1);

      networkStatus.setOnline(true);

      await waitFor(() => JSON.parse(store.getItem(mutationsQueueName)).length === 0);

      expect(cleared).to.equal(1);
    });
  });

  describe('online only mutation', function() {
    it('should succeed', async function() {
      networkStatus.setOnline(false);
      try {
        await client.mutate({
          mutation: ONLINE_ONLY,
          variables: { id: 0 }
        }).catch((error) => {
          expect(error).to.exist;
        });
      } catch (ignore) { }
      try {
        await client.mutate({
          mutation: ADD_TASK,
          variables: newTask
        });
      } catch (ignore) { }

      let offlineMutationStore = JSON.parse(store.getItem(mutationsQueueName));
      expect(offlineMutationStore.length).to.equal(1);
      networkStatus.setOnline(true);
    });
  });

});
