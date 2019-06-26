import server from '../utils/server';
import { createClient } from '../../dist';
import { CacheOperation, getUpdateFunction, createOptimisticResponse } from '../../../offix-cache/dist';
import { ToggleableNetworkStatus } from '../utils/network';
import { ADD_TASK, GET_TASKS, DELETE_TASK, FIND_TASK_BY_TITLE, GET_TASK } from '../utils/graphql.queries';
import { TestStore } from '../utils/testStore';

const CLIENT_HTTP_URL = 'http://localhost:4000/graphql';
const CLIENT_WS_URL = 'ws://localhost:4000/graphql';

const newClient = async (options) => {
  const networkStatus = new ToggleableNetworkStatus();
  const storage = new TestStore();
  const client = await createClient({
    httpUrl: CLIENT_HTTP_URL,
    wsUrl: CLIENT_WS_URL,
    networkStatus,
    storage,
    ...options
  });

  return { client, networkStatus, storage }
}

const goOffline = (networkStatus) => {
  networkStatus.setOnline(false);
};

const goOnline = (networkStatus) => {
  networkStatus.setOnline(false);
};

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

    const { client, networkStatus } = await newClient({
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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({ query: GET_TASKS }, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({ query: GET_TASKS });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it('using only mutationCacheUpdates succeed with a TypeError in the background', async function () {

    const { client, networkStatus } = await newClient({
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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({ query: GET_TASKS }, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({ query: GET_TASKS });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it('using only updateQuery fails', async function () {

    const { client, networkStatus } = await newClient({
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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = client.readQuery({ query: GET_TASKS }, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({ query: GET_TASKS });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });


  it('without cache initialization fails', async function () {

    const { client, networkStatus } = await newClient({
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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // continue
      } else {
        throw e;
      }
    }

    const cache = await client.readQuery({ query: GET_TASKS }, true);

    expect(cache.allTasks).to.exist;
    expect(cache.allTasks.length).to.equal(1);
    expect(cache.allTasks[0].title).to.equal("Test");

    const response = await client.query({ query: GET_TASKS });

    expect(response.data.allTasks).to.exist;
    expect(response.data.allTasks.length).to.equal(1);
    expect(response.data.allTasks[0].title).to.equal("Test");
  });

  it("delete items while offline should succeed", async () => {

    const { client, networkStatus } = await newClient({
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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // store watcher globally and continue
        addTaskPromise = e.networkError.watchOfflineChange();
      } else {
        throw e;
      }
    }

    // Retrieve the new Task from the cache
    const response = await client.query({ query: GET_TASKS });

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
    } catch (e) {
      if (e.networkError && e.networkError.offline) {
        // store watcher globally and continue
        deleteTaskPromise = e.networkError.watchOfflineChange();
      } else {
        throw e;
      }
    }

    // Retrieve the new Task from the cache while still offline
    const response2 = await client.query({ query: GET_TASKS });
    expect(response2.data.allTasks).to.exist;
    expect(response2.data.allTasks.length).to.equal(0);

    // Go back online
    networkStatus.setOnline(true);

    // Wait for all offline transactions to be executed
    await addTaskPromise;
    await deleteTaskPromise;

    // Retrieve again the Tasks
    const response3 = await client.query({ query: GET_TASKS });
    expect(response3.data.allTasks).to.exist;
    expect(response3.data.allTasks.length).to.equal(0);

  });

  describe.only('update single object query while offline', () => {

    const CACHE_ONLY = 'cache-only';

    const TASK_TYPE = 'Task';

    const TASK_TEMPLATE = {
      title: 'Unique',
      description: 'BlaBlaBla',
      version: 1,
    };

    const FIND_TASK_BY_TITLE_QUERY = {
      query: FIND_TASK_BY_TITLE,
      variables: {
        title: TASK_TEMPLATE.title,
      },
    };

    const findTaskByTitle = async (client, options) => {
      return await client.query({
        ...FIND_TASK_BY_TITLE_QUERY,
        ...options
      });
    }

    const addTaskWhileOffline = async (client, options) => {
      try {
        await client.offlineMutation({
          mutation: ADD_TASK,
          variables: TASK_TEMPLATE,
          returnType: TASK_TYPE,
          ...options,
        });
      } catch (e) {
        if (e.networkError && e.networkError.offline) {
          // expected result
          return;
        } else {
          throw e;
        }
      }
      throw 'offlineMutation didn\'t throw OfflineError';
    };

    const assertTaskEqualTaskTemplate = (task, template) => {

      template = { ...TASK_TEMPLATE, ...template };

      expect(task).to.exist;

      if (template.id == null) {
        expect(task.id).to.exist;
      } else {
        expect(task.id).to.equal(template.id);
      }

      expect(task.title).to.equal(template.title);
      expect(task.description).to.equal(template.describe);
      expect(task.version).to.equal(template.version);
    };

    it('create task and the search it by title while offline', async () => {

      const { client, networkStatus: network } = await newClient();

      goOffline(network);

      // create the task while offline
      await addTaskWhileOffline(client, { updateQuery: FIND_TASK_BY_TITLE_QUERY });

      // search the task while still offline from the cache
      const result1 = await findTaskByTitle(client, { fetchPolicy: CACHE_ONLY });

      assertTaskEqualTaskTemplate(result1.data.findTaskByTitle);
    });

    it('search task by title while online, than go offline, create task and search for it again', async () => {

      const { client, networkStatus: network } = await newClient();

      // search the task while online
      const result1 = await findTaskByTitle(client);
      expect(result1.data.findTaskByTitle).to.not.exist;

      goOffline(network);

      // create the task while offline
      await addTaskWhileOffline(client, { updateQuery: FIND_TASK_BY_TITLE_QUERY });

      // search the task while still offline from the cache
      const result2 = await findTaskByTitle(client, { fetchPolicy: CACHE_ONLY });

      assertTaskEqualTaskTemplate(result2.data.findTaskByTitle);
    });

    it('create task and search for it while offline using mutationCacheUpdates', async () => {

      // Impossible situation if applied to real world use case

      const { client, networkStatus } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction('createTask', 'id', FIND_TASK_BY_TITLE_QUERY, CacheOperation.ADD)
        }
      });

      await findTaskByTitle(client);

      goOffline(networkStatus);

      // create the task while offline
      await addTaskWhileOffline(client);

      // search the task while still offline from the cache
      const result1 = await findTaskByTitle(client, { fetchPolicy: CACHE_ONLY });

      assertTaskEqualTaskTemplate(result1);
    });


    it('create a task and query it by id while offline', async () => {

      const { client, networkStatus } = await newClient();

      const optimistic = createOptimisticResponse({
        mutation: ADD_TASK,
        variables: TASK_TEMPLATE,
        returnType: 'Task',
        operationType: CacheOperation.ADD,
        idField: 'id',
      });

      goOffline(networkStatus);

      // create the task while offline using the self generated optimistic response
      await addTaskWhileOffline(client, {
        optimisticResponse: optimistic,
        updateQuery: {
          query: GET_TASK,
          variables: { d: optimistic.id },
        }
      });

      // Get the task while still offline
      const result = await client.query({
        query: GET_TASK,
        variables: { id: optimistic.id },
        fetchPolicy: 'cache-only'
      });

      assertTaskEqualTaskTemplate(result.data.getTask, { id: optimistic.id });
    });
  });
});