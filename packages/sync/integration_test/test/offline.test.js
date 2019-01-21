import { createClient, createOptimisticResponse } from '../../dist';

import { skipRestOnFail } from '../utils/mocha';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import waitFor from '../utils/waitFor';
import { ADD_TASK, GET_TASKS, UPDATE_TASK, DELETE_TASK, ONLINE_ONLY, NO_SQUASH } from '../utils/graphql.queries';

// TODO: error handling when server is down

describe('AeroGear Apollo GraphQL Voyager client', function() {

  this.timeout(0);
  skipRestOnFail();

  const mutationsQueueName = 'offline-mutation-queue';

  const newTask = {
    description: 'new',
    title: 'new'
  };

  const updatedTask = {
    description: 'updated',
    title: 'updated'
  };

  let client;
  let networkStatus;
  let task;

  it('should save mutation to offlineMutationStore while offline', async function() {
    await server.start();

    networkStatus = new ToggleableNetworkStatus();
    networkStatus.setOnline(false);

    const config = {
      httpUrl: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
      networkStatus,
      mutationsQueueName
    };

    client = await createClient(config);

    client.mutate({
      mutation: ADD_TASK,
      variables: newTask
    });

    const offlineMutationStore = JSON.parse(window.localStorage[mutationsQueueName]);

    expect(offlineMutationStore).to.exist;
    expect(offlineMutationStore[0]).to.exist;
    expect(offlineMutationStore[0].operation).to.exist;
    expect(offlineMutationStore[0].operation.operationName).to.equal('createTask');
    expect(offlineMutationStore[0].operation.variables).to.deep.equal(newTask);
  });

  it('should send mutation when going back online', async function() {
    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    const response = await client.query({
      query: GET_TASKS
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal(newTask.title);
    expect(response.data.allTasks[0].description).to.equal(newTask.description);

    task = response.data.allTasks[0];
  });

  it('should save more mutations while offline', async function() {
    networkStatus.setOnline(false);

    const variables = { ...updatedTask, id: task.id, version: task.version };

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    client.mutate({
      mutation: DELETE_TASK,
      variables: { id: task.id }
    });

    const offlineMutationStore = JSON.parse(window.localStorage[mutationsQueueName]);

    expect(offlineMutationStore).to.exist;
    expect(offlineMutationStore.length).to.equal(2);
    expect(offlineMutationStore.find(item => item.operation.operationName === 'updateTask')).to.exist;
    expect(offlineMutationStore.find(item => item.operation.operationName === 'deleteTask')).to.exist;
  });

  it('should send more mutations when back online', async function() {
    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    const response = await client.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only'
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(0);
  });

  it.skip('should be possible to create then update item while offline', async function() {
    networkStatus.setOnline(false);

    client.mutate({
      mutation: ADD_TASK,
      variables: newTask,
      optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
      update: (_, { data: { createTask } }) => task = createTask
    });

    const variables = { ...updatedTask, id: task.id, version: task.version };

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    const response = await client.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only'
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);

    task = response.data.allTasks[0];

    expect(task.title).to.equal(updatedTask.title);
  });

  it.skip('should be possible to create then update item while offline then replaying mutations', async function() {
    await client.mutate({
      mutation: DELETE_TASK,
      variables: { id: task.id },
    });

    networkStatus.setOnline(false);

    client.mutate({
      mutation: ADD_TASK,
      variables: newTask,
      optimisticResponse: createOptimisticResponse('createTask', 'Task', newTask),
      update: (_, { data: { createTask } }) => task = createTask
    });

    const variables = { ...updatedTask, id: task.id, version: task.version };

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    networkStatus = new ToggleableNetworkStatus();

    const config = {
      httpUrl: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
      networkStatus,
      mutationsQueueName
    };

    client = await createClient(config);

    const response = await client.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only'
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);

    task = response.data.allTasks[0];

    expect(task.title).to.equal(updatedTask.title);
  });

  // TODO: remove this test case when the above test case is enabled
  it('create task', async function() {
    const response = await client.mutate({
      mutation: ADD_TASK,
      variables: newTask
    });

    task = response.data.createTask;
  });

  it('should merge offline mutations', async function() {
    networkStatus.setOnline(false);

    const variables = { title: 'update1', description: 'merge', id: task.id, version: task.version };

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    variables.title = 'update2';

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    const offlineMutationStore = JSON.parse(window.localStorage[mutationsQueueName]);

    expect(offlineMutationStore.length).to.equal(1);
    expect(offlineMutationStore[0].operation.variables.title).to.equal(variables.title);

    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    const response = await client.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only'
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);

    task = response.data.allTasks[0];

    expect(task.title).to.equal(variables.title);
  });

  it.skip('should not squash noSquash mutations', async function() {
    networkStatus.setOnline(false);

    const a = client.mutate({
      mutation: NO_SQUASH,
      variables: { id: 0 }
    });

    const b = client.mutate({
      mutation: NO_SQUASH,
      variables: { id: 1 }
    });

    const offlineMutationStore = JSON.parse(window.localStorage[mutationsQueueName]);

    expect(offlineMutationStore.length).to.equal(2);

    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    await a;
    await b;
  });

  it('should not merge offline mutations', async function() {
    networkStatus = new ToggleableNetworkStatus();
    networkStatus.setOnline(false);

    const config = {
      httpUrl: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
      networkStatus,
      mutationsQueueName,
      mergeOfflineMutations: false
    };

    client = await createClient(config);

    const variables = { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version };

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    variables.title = 'nomerge2';

    client.mutate({
      mutation: UPDATE_TASK,
      variables
    });

    const offlineMutationStore = JSON.parse(window.localStorage[mutationsQueueName]);

    expect(offlineMutationStore.length).to.equal(2);
    expect(offlineMutationStore[0].operation.variables.title).to.equal('nomerge1');
    expect(offlineMutationStore[1].operation.variables.title).to.equal(variables.title);

    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    const response = await client.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only'
    });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);

    task = response.data.allTasks[0];

    expect(task.title).to.equal(variables.title);
  });

  it('should notify about offline changes', async function() {
    networkStatus = new ToggleableNetworkStatus();
    networkStatus.setOnline(false);

    let offlineOps = 0;
    let cleared = 0;

    const listener = {
      onOperationEnqueued: () => offlineOps++,
      queueCleared: () => cleared++
    };

    const config = {
      httpUrl: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
      networkStatus,
      mutationsQueueName,
      offlineQueueListener: listener
    };

    client = await createClient(config);

    client.mutate({
      mutation: ADD_TASK,
      variables: newTask
    });

    expect(offlineOps).to.equal(1);

    networkStatus.setOnline(true);

    await waitFor(() => JSON.parse(window.localStorage[mutationsQueueName]).length === 0);

    expect(cleared).to.equal(1);
  });

  it('should not allow online only mutation while offline', async function() {
    networkStatus.setOnline(false);

    const variables = { ...updatedTask, id: task.id, version: task.version };

    try {
      await client.mutate({
        mutation: ONLINE_ONLY,
        variables: variables
      });
    } catch (error) {
      expect(error).to.exist;
      return;
    }
    
    throw new Error('Online mutation should fail when offline');
  });

  it.skip('should allow online only mutation when online', async function() {
    networkStatus.setOnline(true);

    await client.mutate({
      mutation: ONLINE_ONLY,
      variables: { id: 0 }
    });
  });

});
