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
    offlineStorage: storage,
    ...options
  });

  return { client, networkStatus, storage }
}

const goOffline = (networkStatus) => {
  networkStatus.setOnline(false);
};

const goOnline = (networkStatus) => {
  networkStatus.setOnline(true);
};

const CACHE_ONLY = 'cache-only';
const NETWORK_ONLY = 'network-only';

const TASK_TYPE = 'Task';

const TASK_TEMPLATE = {
  title: 'Unique',
  description: 'BlaBlaBla',
  author: "StephenCoady",
  version: 1,
};

const FIND_TASK_BY_TITLE_QUERY = {
  query: FIND_TASK_BY_TITLE,
  variables: {
    title: TASK_TEMPLATE.title,
  },
};

const getTasks = async (client, options) => {
  return await client.query({
    query: GET_TASKS,
    ...options,
  });
}

const findTaskByTitle = async (client, options) => {
  return await client.query({
    ...FIND_TASK_BY_TITLE_QUERY,
    ...options
  });
}

const offlineMutateWhileOffline = async (client, options) => {
  try {
    await client.offlineMutate(options);
  } catch (e) {
    if (e.offline) {
      // expected result
      return e;
    } else {
      throw e;
    }
  }
  throw 'offlineMutate didn\'t throw OfflineError';
}

const addTaskWhileOffline = async (client, options) => {
  return await offlineMutateWhileOffline(client, {
    mutation: ADD_TASK,
    variables: TASK_TEMPLATE,
    returnType: TASK_TYPE,
    ...options,
  });
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
  expect(task.description).to.equal(template.description);
  expect(task.version).to.equal(template.version);
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

  describe('update list query while offline', () => {

    it('query tasks while online, go offline, create task and query tasks again using mutationCacheUpdates and updateQuery', async function () {
      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: GET_TASKS
          }),
        },
      })
      // search for tasks while online
      await getTasks(client);

      goOffline(network);

      // create new task while offline
      await addTaskWhileOffline(client, { updateQuery: GET_TASKS });

      // search for tasks again while offline
      const response = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response.data.allTasks[0]);
    });

    it('query tasks while online, go offline, create task and query tasks again using mutationCacheUpdates', async function () {

      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: GET_TASKS
          })
        },
      })

      // search for tasks while online
      await getTasks(client);

      goOffline(network);

      // create new task while offline
      await addTaskWhileOffline(client);

      // search for tasks again while offline
      const response = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response.data.allTasks[0]);
    });

    it('query tasks while online, go offline, create task and query tasks again using updateQuery', async function () {

      const { client, networkStatus: network } = await newClient()

      // search for tasks while online
      await getTasks(client);

      goOffline(network);

      // create new task while offline
      await addTaskWhileOffline(client, { updateQuery: GET_TASKS });

      // search for tasks again while offline
      const response = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response.data.allTasks[0]);
    });

    it('create task and query tasks while offline using mutationCacheUpdates', async function () {
      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: GET_TASKS
          }),
        }
      })

      goOffline(network);

      await addTaskWhileOffline(client);

      // search for tasks again while offline
      const response = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response.data.allTasks[0]);
    });

    // Not currently supported
    it.skip('create task and query tasks while offline using updateQuery', async function () {

      const { client, networkStatus: network } = await newClient({})

      goOffline(network);

      // create new task while offline
      await addTaskWhileOffline(client, { updateQuery: GET_TASKS });

      // search for tasks again while offline
      const response = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response.data.allTasks).to.exist;
      expect(response.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response.data.allTasks[0]);
    });
  });

  describe('update single object query while offline', () => {
    // Not supported
    it.skip('create task and the search it by title while offline', async () => {
      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: FIND_TASK_BY_TITLE_QUERY
          })
        }
      });

      goOffline(network);

      // create the task while offline
      await addTaskWhileOffline(client, { updateQuery: [FIND_TASK_BY_TITLE_QUERY] });

      // search the task while still offline from the cache
      const result1 = await findTaskByTitle(client, { fetchPolicy: CACHE_ONLY });

      assertTaskEqualTaskTemplate(result1.data.findTaskByTitle);
    });

    it.skip('search task by title while online, than go offline, create task and search for it again', async () => {

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

    it.skip('create task and search for it while offline using mutationCacheUpdates', async () => {

      // Impossible situation if applied to real world use case

      const { client, networkStatus } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: FIND_TASK_BY_TITLE_QUERY
          })
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


    it.skip('create a task and query it by id while offline', async () => {

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

  describe('update list query while offline and then go back online', () => {

    it.skip("query tasks while online, go offline, create task, delete task, go back online using mutationCacheUpdates", async () => {

      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: GET_TASKS
          }),
          deleteTask: getUpdateFunction({
            mutationName: 'deleteTask',
            updateQuery: GET_TASKS,
            operationType: CacheOperation.DELETE
          })
        },
      });

      // search tasks while online
      await getTasks(client);

      goOffline(network);

      // create new task while offline
      const addTaskError = await addTaskWhileOffline(client, { updateQuery: GET_TASKS });

      // retrieve the new task from the cache
      const response1 = await getTasks(client, { fetchPolicy: CACHE_ONLY });

      expect(response1.data.allTasks).to.exist;
      expect(response1.data.allTasks.length).to.equal(1);
      assertTaskEqualTaskTemplate(response1.data.allTasks[0]);

      const task = response1.data.allTasks[0];
      // delete the task while offline
      const deleteTaskError = await offlineMutateWhileOffline(client, {
        mutation: DELETE_TASK,
        variables: { id: task.id },
        operationType: CacheOperation.DELETE,
        returnType: TASK_TYPE,
        updateQuery: GET_TASKS,
      }).catch (ignore => {});
      // query tasks while still offline
      const response2 = await getTasks(client, { fetchPolicy: CACHE_ONLY });
      expect(response2.data.allTasks).to.exist;
      expect(response2.data.allTasks.length).to.equal(0);

      goOnline(network);

      await addTaskError.watchOfflineChange();
      await deleteTaskError.watchOfflineChange();

      // query tasks again from the cache
      const response3 = await getTasks(client, {fetchPolicy: CACHE_ONLY});
      expect(response3.data.allTasks).to.exist;
      expect(response3.data.allTasks.length).to.equal(0);
    });

    it("query tasks while online, go offline, create task, delete task, go back online using mutationCacheUpdates", async () => {

      const { client, networkStatus: network } = await newClient({
        mutationCacheUpdates: {
          createTask: getUpdateFunction({
            mutationName: 'createTask',
            updateQuery: GET_TASKS
          })
        },
      });

      // search tasks while online
      await getTasks(client);

      goOffline(network);

      // create new task while offline
      const addTaskError = await addTaskWhileOffline(client, { updateQuery: GET_TASKS });

      // retrieve the new task from the cache
      const getTasksQuery = await getTasks(client, { fetchPolicy: CACHE_ONLY });
      const task = getTasksQuery.data.allTasks[0];

      assertTaskEqualTaskTemplate(task);

      goOnline(network);

      // wait for all offline transactions to be executed
      const replicatedData = await addTaskError.watchOfflineChange();
      assertTaskEqualTaskTemplate(replicatedData.data.createTask)
    });
  })
});
