import { createClient } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import {
  ADD_TASK,
  GET_TASKS,
  UPDATE_TASK_CONFLICT_REJECT,
  UPDATE_TASK_CLIENT_RESOLUTION,
  UPDATE_TASK_CUSTOM_CLIENT_RESOLUTION,
  UPDATE_TASK_SERVER_RESOLUTION
} from '../utils/graphql.queries';

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const customResolution = (serverData, clientData) => {
  return {
    ...serverData,
    ...clientData,
    title: 'custom'
  }
};

const newClient = async (clientOptions = {}) => {
  const config = {
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    ...clientOptions,
    conflictStrategy: {
      strategies: {
        "updateTaskCustomClientResolution": customResolution
      }
    }
  };

  return await createClient(config);
};

describe('Conflicts', function() {

  this.timeout(2000);

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
    client = await newClient({ networkStatus, storage: store });
  });

  const createConflict = async (mutation) => {
    networkStatus.setOnline(true);

    const response = await client.mutate({
      mutation: ADD_TASK,
      variables: newTask
    });

    const task = response.data.createTask;

    networkStatus.setOnline(false);

    const networkStatus2 = newNetworkStatus();
    const store2 = new TestStore();
    const client2 = await newClient({ networkStatus: networkStatus2, storage: store2 });

    const variables2 = { ...updatedTask, id: task.id, version: task.version };

    await client2.mutate({
      mutation,
      variables: variables2
    });

    let success = 0;
    let failure = 0;

    const listener = {
      onOperationSuccess: () => success++,
      onOperationFailure: () => failure++
    };

    client = await newClient({ networkStatus, storage: store, offlineQueueListener: listener });

    const variables = { title: 'client', description: 'client', id: task.id, version: task.version };

    await client.mutate({
      mutation,
      variables
    }).catch(error => {
      return;
    })

    networkStatus.setOnline(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    return { success, failure };
  };

  describe('reject update on conflict', function() {

    it('should succeed', async function() {
      const { success, failure } = await createConflict(UPDATE_TASK_CONFLICT_REJECT);

      expect(success).to.equal(0);
      expect(failure).to.equal(1);

      const response = await client.query({
        query: GET_TASKS
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
      expect(response.data.allTasks[0].description).to.equal(updatedTask.description);
    });

  });

  describe('resolve conflict on client', function() {

    it('should succeed', async function() {
      const { success, failure } = await createConflict(UPDATE_TASK_CLIENT_RESOLUTION);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      const response = await client.query({
        query: GET_TASKS
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal('client');
      expect(response.data.allTasks[0].description).to.equal('client');
    });

  });

  describe('resolve conflict on server', function() {

    it('should succeed', async function() {
      const { success, failure } = await createConflict(UPDATE_TASK_SERVER_RESOLUTION);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      const response = await client.query({
        query: GET_TASKS
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal('client');
      expect(response.data.allTasks[0].description).to.equal('client');
    });

  });

  describe('custom resolution strategy', function() {

    it('should succeed', async function() {
      const { success, failure } = await createConflict(UPDATE_TASK_CUSTOM_CLIENT_RESOLUTION);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      const response = await client.query({
        query: GET_TASKS
      });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal('custom');
      expect(response.data.allTasks[0].description).to.equal('client');
    });

  });

});
