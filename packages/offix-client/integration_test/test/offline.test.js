import { createClient } from '../../dist'
import { createOptimisticResponse, CacheOperation } from 'offix-cache';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import waitFor from '../utils/waitFor';
import timeout from '../utils/timeout';
import { ADD_TASK, GET_TASKS, UPDATE_TASK, DELETE_TASK } from '../utils/graphql.queries';

function wait(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
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

describe('Offline mutations', function () {

  this.timeout(20000);

  const mutationsQueueName = 'offline-mutation-queue';

  const newTask = {
    description: 'new',
    title: 'new',
    version: 1,
    author: "new"
  };

  const optimisticOptions = {
    mutation: ADD_TASK,
    operationType: CacheOperation.ADD,
    typeName: "Task",
    variables: newTask,
    updateQuery: GET_TASKS
  };

  const updatedTask = {
    description: 'updated',
    title: 'updated'
  };

  let client, networkStatus, store;

  before('start server', async function () {
    await server.start();
  });

  after('stop server', async function () {
    await server.stop();
  });

  beforeEach('reset server', async function () {
    await server.reset();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus(false);
    store = new TestStore();
    client = await newClient({ networkStatus, storage: store, mutationsQueueName });
  });

  async function isQueueEmpty() {
    const store = await store.getItem(offlineMetaKey);
    return store.length === 0
  }

  // describe('save mutation to offlineMutationStore while offline', function () {

  //   it('should succeed', async function () {
  //     await client.offlineMutation({
  //       mutation: ADD_TASK,
  //       variables: newTask
  //     }).catch(err => {});

  //     const offlineKeys = await store.getItem(offlineMetaKey);
  //     const offlineItem = await store.getItem("offline:" + offlineKeys[0]);

  //     expect(offlineItem).to.exist;
  //     expect(offlineItem.operationName).to.equal('createTask');
  //     expect(offlineItem.variables).to.exist;
  //     expect(offlineItem.query).to.equal(ADD_TASK);
  //     expect(offlineItem.variables.title).to.equal(newTask.title);
  //     expect(offlineItem.variables.description).to.equal(newTask.description);
  //   });

  // });

  // describe('send mutation when going back online', function () {

  //   beforeEach('prepare data', async function () {
  //     console.log('client', client)
  //       await client.offlineMutation({
  //         mutation: ADD_TASK,
  //         variables: newTask
  //       }).catch((err) => {
  //         const promise = err.offlineMutationPromise

  //         promise.then((result) => {
  //           console.log('offline changes replicated', result)
  //         }).catch((err) => {
  //           console.log('error replicating offline changes', err)
  //         })
  //       })
  //   });

  //   it('should succeed', async function () {
  //     networkStatus.setOnline(true);

  //     // await wait(200)

  //     const response = await client.query({
  //       query: GET_TASKS
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(1);
  //     expect(response.data.allTasks[0].title).to.equal(newTask.title);
  //     expect(response.data.allTasks[0].description).to.equal(newTask.description);
  //   });

  // });

  // describe('save more mutations while offline', function () {

  //   let task;

  //   beforeEach('prepare data', async function () {
  //     networkStatus.setOnline(true);

  //     const response = await client.offlineMutation({
  //       mutation: ADD_TASK,
  //       variables: newTask
  //     });

  //     task = response.data.createTask;

  //     networkStatus.setOnline(false);
  //   });

  //   it('should succeed', async function () {
  //     const variables = { ...updatedTask, id: task.id, version: task.version };
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         variables
  //       });
  //     } catch (ignore) { }

  //     try {
  //       await client.offlineMutation({
  //         mutation: DELETE_TASK,
  //         variables: { id: task.id }
  //       });
  //     } catch (ignore) { }

  //     const offlineKeys = await store.getItem(offlineMetaKey);
  //     const offlineMutation1 = await store.getItem("offline:" + offlineKeys[0]);
  //     const offlineMutation2 = await store.getItem("offline:" + offlineKeys[1]);

  //     expect(offlineMutation1).to.exist;
  //     expect(offlineMutation2).to.exist;
  //     expect(offlineMutation1.operationName).to.equal('updateTask');
  //     expect(offlineMutation2.operationName).to.equal('deleteTask');
  //   });
  // });

  // describe('send more mutations when back online', function () {

  //   beforeEach('prepare data', async function () {
  //     networkStatus.setOnline(true);

  //     const response = await client.mutate({
  //       mutation: ADD_TASK,
  //       variables: newTask
  //     });

  //     networkStatus.setOnline(false);

  //     const task = response.data.createTask;
  //     const variables = { ...task, ...updatedTask };

  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         variables
  //       });
  //     } catch (ignore) { }
  //     try {
  //       await client.offlineMutation({
  //         mutation: DELETE_TASK,
  //         variables: { id: task.id }
  //       });
  //     } catch (ignore) { }
  //   });

  //   it('should succeed', async function () {
  //     networkStatus.setOnline(true);

  //     await new Promise(resolve => setTimeout(resolve, 300));

  //     const response = await client.query({
  //       query: GET_TASKS,
  //       fetchPolicy: 'network-only'
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(0);
  //   });
  // });

  // describe('create then update item while offline', function () {
  //   it('should succeed', async function () {
  //     let task;
  //     try {
  //       await client.offlineMutation({
  //         mutation: ADD_TASK,
  //         variables: newTask,
  //         optimisticResponse: createOptimisticResponse(optimisticOptions),
  //         update: (_, { data: { createTask } }) => task = createTask
  //       });
  //     } catch (ignore) { }

  //     const variables = { ...updatedTask, id: task.id, version: task.version };

  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         variables
  //       });
  //     } catch (ignore) { }

  //     networkStatus.setOnline(true);

  //     await new Promise(resolve => setTimeout(resolve, 300));

  //     const response = await client.query({
  //       query: GET_TASKS,
  //       fetchPolicy: 'network-only'
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(1);
  //     expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
  //   });
  // });

  // describe('create then update item while offline then replaying mutations', function () {
  //   it('should succeed', async function () {
  //     let task;
  //     try {
  //       await client.offlineMutation({
  //         mutation: ADD_TASK,
  //         variables: newTask,
  //         optimisticResponse: createOptimisticResponse(optimisticOptions),
  //         update: (_, { data: { createTask } }) => task = createTask
  //       });
  //     } catch (err) {
  //       console.log(err)
  //       const promise = err.offlineMutationPromise

  //         promise.then((result) => {
  //           console.log('offline changes replicated', result)
  //         }).catch((err) => {
  //           console.log('error replicating offline changes', err)
  //         })
  //     }

  //     console.log('TASK AFTER OFFLINE CREATE', task)

  //     const variables = { ...updatedTask, id: task.id, version: task.version };
  //     console.log('client going to update task', variables)
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         variables
  //       });
  //     } catch (err) { 
  //       console.log(err)
  //       const promise = err.offlineMutationPromise

  //         promise.then((result) => {
  //           console.log('offline changes replicated', result)
  //         }).catch((err) => {
  //           console.log('error replicating offline changes', err)
  //         })
  //     }
  //     networkStatus = newNetworkStatus();
  //     console.log('store', store.data)
  //     client = await newClient({ networkStatus, storage: store, mutationsQueueName });

  //     await new Promise(resolve => setTimeout(resolve, 3000));

  //     const response = await client.query({
  //       query: GET_TASKS,
  //       fetchPolicy: 'network-only'
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(1);
  //     expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
  //   });
  // });


  // describe('replaying mutations with mutationCacheUpdates', function () {
  //   it('should succeed', async function () {
  //     let task;
  //     let updateMethod = (_, { data: { createTask } }) => task = createTask;
  //     try {
  //       await client.offlineMutation({
  //         mutation: ADD_TASK,
  //         variables: newTask,
  //         optimisticResponse: createOptimisticResponse(optimisticOptions),
  //         update: updateMethod
  //       });
  //     } catch (ignore) { }

  //     const variables = { ...updatedTask, id: task.id, version: task.version };
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         variables
  //       });
  //     } catch (ignore) { }

  //     networkStatus = newNetworkStatus();
  //     client = await newClient({
  //       mutationCacheUpdates: { updateTask: updateMethod }, networkStatus, storage: store, mutationsQueueName,
  //     });

  //     await new Promise(resolve => setTimeout(resolve, 100));

  //     const response = await client.query({
  //       query: GET_TASKS,
  //       fetchPolicy: 'cache-first'
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(1);
  //     expect(response.data.allTasks[0].title).to.equal(updatedTask.title);
  //   });
  // });

  describe('queue offline mutations', function () {

    let task;

    beforeEach('prepare data', async function () {
      networkStatus.setOnline(true);

      const response = await client.offlineMutation({
        mutation: ADD_TASK,
        variables: newTask,
        returnType: "Task",
        optimisticResponse: createOptimisticResponse(optimisticOptions),
      });

      task = response.data.createTask;

      networkStatus.setOnline(false);
    });

    it('should succeed', async function () {
      
      try {
        await client.offlineMutation({
          mutation: UPDATE_TASK,
          returnType: 'Task',
          variables: { title: 'update1', description: 'merge', id: task.id, version: task.version }
        });
      } catch (err) { 
        console.log(err)
      }

      try {
        await client.offlineMutation({
          mutation: UPDATE_TASK,
          returnType: 'Task',
          variables: { title: 'update2', description: 'merge', id: task.id, version: task.version }
        });
      } catch (err) { 
        console.log(err)
      }
      

      const offlineKeys = await store.getItem(offlineMetaKey);

      console.log(JSON.stringify(offlineKeys, null, 2))

      const offlineMutation1 = await store.getItem("offline:" + offlineKeys[0]);
      const offlineMutation2 = await store.getItem("offline:" + offlineKeys[1]);

      console.log(JSON.stringify(offlineMutation1.variables, null, 2))
      console.log(JSON.stringify(offlineMutation2.variables, null, 2))

      const offlineData = await client.queue.store.getOfflineData()

      // console.log(client.queue.queue[0])
      console.log(JSON.stringify(offlineData, null, 2));

      expect(offlineMutation1).to.exist;
      expect(offlineMutation2).to.exist;
      expect(offlineMutation1.variables.title).to.equal('update1');
      expect(offlineMutation2.variables.title).to.equal('update2');

      debugger
      networkStatus.setOnline(true);

      await waitFor(() => isQueueEmpty, 1000);
      await timeout(1000);

      const response = await client.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });
 
      debugger
      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      expect(response.data.allTasks[0].title).to.equal(variables.title);

    });
  });

  // describe('do not merge offline mutations', function () {

  //   let task;

  //   beforeEach('prepare data', async function () {
  //     client = await newClient({ networkStatus, storage: store, mutationsQueueName });
  //     networkStatus.setOnline(true);

  //     const response = await client.offlineMutation({
  //       mutation: ADD_TASK,
  //       variables: newTask,
  //       optimisticResponse: createOptimisticResponse(optimisticOptions),
  //     });

  //     task = response.data.createTask;

  //     networkStatus.setOnline(false);
  //   });

  //   it('should succeed', async function () {
  //     const variables = { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version };
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         returnType: "Task",
  //         variables
  //       });
  //     } catch (ignore) { }

  //     variables.title = 'nomerge2';
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         returnType: "Task",
  //         variables
  //       });
  //     } catch (ignore) { }

  //     const offlineKeys = await store.getItem(offlineMetaKey);
  //     const offlineMutation1 = await store.getItem("offline:" + offlineKeys[0]);
  //     const offlineMutation2 = await store.getItem("offline:" + offlineKeys[1]);

  //     expect(offlineMutation1).to.exist;
  //     expect(offlineMutation2).to.exist;
  //     expect(offlineMutation1.variables.title).to.equal('nomerge1');
  //     expect(offlineMutation2.variables.title).to.equal(variables.title);

  //     networkStatus.setOnline(true);

  //     await waitFor(() => isQueueEmpty, 100);
  //     await timeout(100);

  //     const response = await client.query({
  //       query: GET_TASKS,
  //       fetchPolicy: 'network-only'
  //     });

  //     expect(response.data.allTasks).to.exist;
  //     expect(response.data.allTasks.length).to.equal(1);
  //     expect(response.data.allTasks[0].title).to.equal(variables.title);
  //   });
  // });

  // describe('ensure offline params are added to offline object ', function () {

  //   let task;

  //   beforeEach('prepare data', async function () {
  //     client = await newClient({ networkStatus, storage: store, mutationsQueueName });
  //     networkStatus.setOnline(true);

  //     const response = await client.offlineMutation({
  //       mutation: ADD_TASK,
  //       variables: newTask,
  //       optimisticResponse: createOptimisticResponse(optimisticOptions),
  //     });

  //     task = response.data.createTask;

  //     networkStatus.setOnline(false);
  //   });

  //   it('should succeed', async function () {
  //     const variables = { title: 'nomerge1', description: 'nomerge', id: task.id, version: task.version };
  //     try {
  //       await client.offlineMutation({
  //         mutation: UPDATE_TASK,
  //         returnType: "Task",
  //         variables,
  //         idField: "someOtherField",
  //         returnType: "ADifferentType"
  //       });
  //     } catch (ignore) { }


  //     const offlineKeys = await store.getItem(offlineMetaKey);
  //     const offlineMutation1 = await store.getItem("offline:" + offlineKeys[0]);

  //     expect(offlineMutation1).to.exist;
  //     expect(offlineMutation1.returnType).to.equal('ADifferentType');
  //     expect(offlineMutation1.idField).to.equal('someOtherField');

  //   });
  // });

  // describe('notify about offline changes', function () {
  //   it('should succeed', async function () {
  //     let offlineOps = 0;
  //     let cleared = 0;

  //     const listener = {
  //       onOperationEnqueued: () => offlineOps++,
  //       queueCleared: () => cleared++
  //     };

  //     client = await newClient({ networkStatus, storage: store, mutationsQueueName, offlineQueueListener: listener });
  //     try {
  //       await client.offlineMutation({
  //         mutation: ADD_TASK,
  //         variables: newTask
  //       });
  //     } catch (ignore) { }

  //     expect(offlineOps).to.equal(1);

  //     networkStatus.setOnline(true);

  //     await new Promise(resolve => setTimeout(resolve, 300));

  //     expect(cleared).to.equal(1);
  //   });
  // });
});


