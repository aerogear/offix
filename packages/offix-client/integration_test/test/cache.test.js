import server from '../utils/server';
import { createClient } from '../../dist';
import { CacheOperation, getUpdateFunction, createOptimisticResponse } from '../../../offix-cache/dist';
import { ToggleableNetworkStatus } from '../utils/network';
import { ADD_TASK, GET_TASKS, DELETE_TASK, FIND_TASK_BY_TITLE, GET_TASK } from '../utils/graphql.queries';
import { TestStore } from '../utils/testStore';

const newClient = async (options) => {
  const networkStatus = new ToggleableNetworkStatus();
  const storage = new TestStore();
  const client = await createClient({
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    networkStatus,
    storage,
    ...options
  });
  return { client, networkStatus, storage };
}

describe("Offline cache and mutations", () => {

  before('start server', async function () {
    await server.start();
  });

  after('stop server', async function () {
    await server.stop();
  });

  beforeEach('reset server', async function () {
    await server.reset();
  });

  it('using mutationCacheUpdates and updateQuery succeed', async function () {

    const {client, networkStatus} = await newClient({
      mutationCacheUpdates: {
        createTask: getUpdateFunction('createTask', 'id', GET_TASKS, CacheOperation.ADD),
      },
    })

    // Workaround: initialize cache
    await client.query({ query: GET_TASKS });

    networkStatus.setOnline(false);

    try {
      await client.offlineMutation({
        mutation: ADD_TASK,
        variables: {
          title: "Test",
          description: "Blablabla",
          version: 1,
        },
        updateQuery: GET_TASKS, // Workaround: suppress TypeError
        returnType: 'Task'
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({query: GET_TASKS}, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({query: GET_TASKS});

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it('using only mutationCacheUpdates succeed with a TypeError in the background', async function () {

    const {client, networkStatus} = await newClient({
      mutationCacheUpdates: {
        createTask: getUpdateFunction('createTask', 'id', GET_TASKS, CacheOperation.ADD),
      },
    })

    // Workaround: initialize cache
    await client.query({ query: GET_TASKS });

    networkStatus.setOnline(false);

    try {
      await client.offlineMutation({
        mutation: ADD_TASK,
        variables: {
          title: "Test",
          description: "Blablabla",
          version: 1,
        },
        // updateQuery: GET_TASKS,
        returnType: 'Task'
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({query: GET_TASKS}, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({query: GET_TASKS});

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it('using only updateQuery fails', async function () {

    const {client, networkStatus} = await newClient({
      // mutationCacheUpdates: {
      //   createTask: getUpdateFunction('createTask', 'id', GET_TASKS, CacheOperation.ADD),
      // },
    })

    // Workaround: initialize cache
    await client.query({ query: GET_TASKS });

    networkStatus.setOnline(false);

    try {
      await client.offlineMutation({
        mutation: ADD_TASK,
        variables: {
          title: "Test",
          description: "Blablabla",
          version: 1,
        },
        updateQuery: GET_TASKS,
        returnType: 'Task'
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({query: GET_TASKS}, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({query: GET_TASKS});

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });


  it('without cache initialization fails', async function () {

    const {client, networkStatus} = await newClient({
      mutationCacheUpdates: {
        createTask: getUpdateFunction('createTask', 'id', GET_TASKS, CacheOperation.ADD),
      },
    })

    // Workaround: initialize cache
    // await client.query({ query: GET_TASKS });

    networkStatus.setOnline(false);

    try {
      await client.offlineMutation({
        mutation: ADD_TASK,
        variables: {
          title: "Test",
          description: "Blablabla",
          version: 1,
        },
        updateQuery: GET_TASKS,
        returnType: 'Task'
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = await client.readQuery({query: GET_TASKS}, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({query: GET_TASKS});

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it("delete items while offline should succeed", async () => {

    const {client, networkStatus} = await newClient({
      mutationCacheUpdates: {
        createTask: getUpdateFunction('createTask', 'id', GET_TASKS, CacheOperation.ADD),
        deleteTask: getUpdateFunction('deleteTask', 'id', GET_TASKS, CacheOperation.DELETE),
      },
    });

    // Workaround: initialize cache
    await client.query({ query: GET_TASKS });

    networkStatus.setOnline(false);

    // Create a new Task
    let addTaskPromise;
    try {
      await client.offlineMutation({
        mutation: ADD_TASK,
        variables: {
          title: "Test",
          description: "Blablabla",
          version: 1,
        },
        updateQuery: GET_TASKS,
        returnType: 'Task'
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // store watcher globally and continue
        addTaskPromise = e.networkError.watchOfflineChange();
      } else {
        throw e;
      }
    }

    // Retrieve the new Task from the cache
    const response = await client.query({query: GET_TASKS});

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);

    const task = response.data.allTasks[0];
    expect(task.title).to.equal("Test");
    expect(task.id).to.exist;

    // Delete the task
    let deleteTaskPromise;
    try {
      await client.offlineMutation({
        mutation: DELETE_TASK,
        variables: {
          id: task.id,
        },
        updateQuery: GET_TASKS,
        returnType: 'Task',
        operationType: CacheOperation.DELETE,
      });
    } catch(e) {
      if (e.networkError && e.networkError.offline) {
        // store watcher globally and continue
        deleteTaskPromise = e.networkError.watchOfflineChange();
      } else {
        throw e;
      }
    }

    // Retrieve the new Task from the cache while still offline
    const response2 = await client.query({query: GET_TASKS});
    expect(response2.data.allTasks).to.exist;
    expect(response2.data.allTasks.length).to.equal(0);

    // Go back online
    networkStatus.setOnline(true);

    // Wait for all offline transactions to be executed
    await addTaskPromise;
    await deleteTaskPromise;

    // Retrieve again the Tasks
    const response3 = await client.query({query: GET_TASKS});
    expect(response3.data.allTasks).to.exist;
    expect(response3.data.allTasks.length).to.equal(0);

  });

  describe.only('update single object query while offline', () => {

    const newTask = {
      title: 'Unique',
      description: 'BlaBlaBla',
      version: 1,
    }

    const findTaskByTitleQuery = {
      query: FIND_TASK_BY_TITLE,
      variables: {
        title: newTask.title,
      },
    };

    const goOffline = (networkStatus) => {
      networkStatus.setOnline(false);
    };

    const goOnline = (networkStatus) => {
      networkStatus.setOnline(false);
    };

    const findTask = async (client, options) => {
      return await client.query({ ...findTaskByTitleQuery, ...options });
    }

    const findTaskCacheOnly = async (client, options) => {
      return await findTask(client, { fetchPolicy: 'cache-only', ...options });
    }

    const addTask = async (client, options) => {
      try {
        await client.offlineMutation({
          mutation: ADD_TASK,
          variables: newTask,
          returnType: 'Task',
          ...options,
        });
      } catch(e) {
        if (e.networkError && e.networkError.offline) {
          // continue
        } else {
          throw e;
        }
      }
    };

    it('findTaskByTitle', async () => {

      const {client, networkStatus} = await newClient();
    
      goOffline(networkStatus);

      // Add the task while offline
      await addTask(client, { updateQuery: findTaskByTitleQuery });

      // Search the task while still offline from the cache
      const result2 = await findTaskCacheOnly(client);

      expect(result2.data.findTaskByTitle).to.exist;
      expect(result2.data.findTaskByTitle.title).to.equal(newTask.title);
    });

    it('findTaskByTitle with cache initialization', async () => {

      const {client, networkStatus} = await newClient();
    
      // Try to find the task in order to initialize the cache
      const result1 = await findTask(client);
    
      expect(result1.data.findTaskByTitle).to.not.exist;

      goOffline(networkStatus);

      // Add the task while offline
      await addTask(client, { updateQuery: findTaskByTitleQuery });

      // Search the task while still offline from the cache
      const result2 = await findTaskCacheOnly(client);

      expect(result2.data.findTaskByTitle).to.exist;
      expect(result2.data.findTaskByTitle.title).to.equal(newTask.title);
    });

    it('findTaskByTitle with mutationCacheUpdates', async () => {

      const {client, networkStatus} = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction('createTask', 'id', findTaskByTitleQuery, CacheOperation.ADD)
        }
      });

      // Initialize cache
      await findTask(client);

      goOffline(networkStatus);

      // Add the task while offline
      await addTask(client);

      // Search the task while still offline from the cache
      const result2 = await findTaskCacheOnly(client);

      expect(result2.data.findTaskByTitle).to.exist;
      expect(result2.data.findTaskByTitle.title).to.equal(newTask.title);
    });


    it('getTask with previous generated optimisticResponse', async () => {

      // TODO: Work in progress

      const {client, networkStatus} = await newClient();

      goOffline(networkStatus);

      const newOptimisticTask = createOptimisticResponse({
        mutation: ADD_TASK,
        variables: newTask,
        returnType: 'Task',
        operationType: CacheOperation.ADD,
        idField: 'id',
      });

      // Add the task while offline using the self generated optimistic response
      await addTask(client, {optimisticResponse: newOptimisticTask});

      // Get the task while still offline
      const result = await client.query({
        query: GET_TASK, 
        variables: { id: newOptimisticTask.id }, 
        fetchPolicy: 'cache-only'
      });

      expect(result.data.findTaskByTitle).to.exist;
      expect(result.data.findTaskByTitle.title).to.equal(newTask.title);
    });

  })
});