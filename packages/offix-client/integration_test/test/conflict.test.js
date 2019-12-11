import { ApolloOfflineClient } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from 'apollo-link-http';
import { TestxDirector } from "graphql-testx/dist/src/TestxDirector"
import gql from 'graphql-tag';

const TESTX_CONTROLLER_URL = "http://localhost:4002";

let server;
let httpUrl;

let FIND_ALL_TASKS;
let CREATE_TASK;
let UPDATE_TASK;

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const newClient = async (clientOptions = {}) => {
  const link = new HttpLink({ uri: httpUrl })
  const config = {
    cacheStorage: new TestStore(),
    link,
    cache: new InMemoryCache(),
    ...clientOptions
  };

  const client = new ApolloOfflineClient(config);
  await client.init()
  return client
};

describe('Conflicts', function () {

  this.timeout(2000);

  const newTask = {
    description: 'new',
    title: 'new',
    version: 1,
    author: 'new'
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
  });

  after('stop server', async function () {
    this.timeout(0)
    await server.close();
  });

  beforeEach('reset server', async function () {
    await server.cleanDatabase();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus(false);
    store = new TestStore();
    client = await newClient({ networkStatus, offlineStorage: store });
  });

  const createBasicConflict = async (mutation, variables1, variables2, secondClient, customConflict) => {
    networkStatus.setOnline(true);

    const response = await client.mutate({
      mutation: CREATE_TASK,
      variables: newTask
    }).catch(error => {
      return;
    })


    const task = response.data.createTask;

    let success = 0;
    let failure = 0;

    let conflict = 0;
    let merge = 0;

    const listener = {
      onOperationSuccess: () => success++,
      onOperationFailure: () => failure++
    };

    const conflictListener = {
      conflictOccurred: () => conflict++,
      mergeOccurred: () => merge++
    }


    if (customConflict) {
      const customStrategy = {
        resolve: ({ base: baseData, server: serverData, client: clientData }) => {
          const something = Object.assign(baseData, serverData, clientData);
          something.description = 'custom';
          return something;
        }
      };
      client = await newClient({ networkStatus, offlineStorage: store, offlineQueueListener: listener, conflictListener, conflictStrategy: customStrategy });
    } else {
      client = await newClient({ networkStatus, offlineStorage: store, offlineQueueListener: listener, conflictListener });
    }

    const result = await client.query({
      query: FIND_ALL_TASKS
    });

    console.log("GET TASKS", result.data.findAllTasks[0]);

    await secondClient.query({
      query: FIND_ALL_TASKS
    });

    const vars1 = { ...variables1, id: 1, version: 1 };
    const vars2 = { ...variables2, id: 1, version: 1 };
    await secondClient.offlineMutate({
      mutation,
      variables: vars1,
      returnType: 'Task'
    })

    networkStatus.setOnline(false);

    await client.offlineMutate({
      mutation,
      variables: vars2,
      returnType: 'Task'
    }).catch(error => {
      return;
    })
    networkStatus.setOnline(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    return { success, failure, conflict, merge };
  };

  const createAdvancedClientConflict = async (mutation, variables1, variables2, secondClient, customConflict) => {
    networkStatus.setOnline(true);

    const response = await client.mutate({
      mutation: CREATE_TASK,
      variables: newTask
    });

    const task = response.data.createTask;

    let success = 0;
    let failure = 0;

    let conflict = 0;
    let merge = 0;

    const listener = {
      onOperationSuccess: () => success++,
      onOperationFailure: () => failure++
    };

    const conflictListener = {
      conflictOccurred: () => conflict++,
      mergeOccurred: () => merge++
    }

    client = await newClient({ networkStatus, offlineStorage: store, offlineQueueListener: listener, conflictListener });

    await client.query({
      query: FIND_ALL_TASKS
    });

    await secondClient.query({
      query: FIND_ALL_TASKS
    });

    const vars1 = { ...variables1, id: 1, version: 1 };
    const vars2 = { ...variables2, id: 1, version: 1 };
    const vars3 = { ...variables2, id: 1, version: 1, author: "Advanced conflict author" };
    await secondClient.offlineMutate({
      mutation,
      variables: vars1,
      returnType: 'Task'
    });

    networkStatus.setOnline(false);

    await client.offlineMutate({
      mutation,
      variables: vars2,
      returnType: 'Task'

    }).catch(error => {
      return;
    })

    await client.offlineMutate({
      mutation,
      variables: vars3,
      returnType: 'Task'

    }).catch(error => {
      return;
    })

    networkStatus.setOnline(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    return { success, failure, conflict, merge };
  };

  const createAdvancedServerConflict = async (mutation, variables1, variables2, secondClient, customConflict) => {
    networkStatus.setOnline(true);

    const response = await client.mutate({
      mutation: CREATE_TASK,
      variables: newTask
    });

    const task = response.data.createTask;

    let success = 0;
    let failure = 0;

    let conflict = 0;
    let merge = 0;

    const listener = {
      onOperationSuccess: () => success++,
      onOperationFailure: () => failure++
    };

    const conflictListener = {
      conflictOccurred: () => conflict++,
      mergeOccurred: () => merge++
    }

    client = await newClient({ networkStatus, offlineStorage: store, offlineQueueListener: listener, conflictListener });

    await client.query({
      query: FIND_ALL_TASKS
    });

    await secondClient.query({
      query: FIND_ALL_TASKS
    });

    const vars1 = { ...variables1, id: 1, version: 1 };
    const vars2 = { ...variables2, id: 1, version: 1 };
    const vars3 = { ...variables2, id: 1, version: 1, author: "Advanced conflict author" };
    await secondClient.offlineMutate({
      mutation,
      variables: vars1,
      returnType: 'Task'
    });

    await secondClient.offlineMutate({
      mutation,
      variables: vars2,
      returnType: 'Task'
    }).catch(ignore => {
      return;
    });
    networkStatus.setOnline(false);

    await client.offlineMutate({
      mutation,
      variables: vars3,
      returnType: 'Task'
    }).catch(error => {
      return;
    })

    networkStatus.setOnline(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    return { success, failure, conflict, merge };
  };

  describe('no conflict should be thrown for mergeable data', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedDescription = { title: "new", description: "updated", author: "new" };
      const store2 = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure } = await createBasicConflict(UPDATE_TASK, updatedTitle, updatedDescription, client2);


      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });


      console.log("ALL TASKS", response.data.findAllTasks);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('updated');
      expect(response.data.findAllTasks[0].description).to.equal('updated');
    });

  });

  describe('merge should be called for mergeable conflict', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedDescription = { title: "new", description: "updated", author: "new" };
      const store2 = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure, conflict, merge } = await createBasicConflict(UPDATE_TASK, updatedTitle, updatedDescription, client2);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });
      console.log("ALL TASKS", response.data.findAllTasks);

      expect(conflict).to.equal(0);
      expect(merge).to.equal(1);
      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('updated');
      expect(response.data.findAllTasks[0].description).to.equal('updated');
    });

  });

  describe('conflict should be called for unmergeable data', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedTitleAgain = { title: "another update with conflict", description: "new", author: "new" };
      const networkStatus = newNetworkStatus();

      const store2 = new TestStore();
      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure, conflict } = await createBasicConflict(UPDATE_TASK, updatedTitle, updatedTitleAgain, client2);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });
      console.log("ALL TASKS", response.data.findAllTasks);

      expect(conflict).to.equal(1);
      expect(failure).to.equal(0);
      expect(success).to.equal(1);

    });

  });

  describe('custom resolution strategy should override', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "new", description: "new", author: "new" };
      const updatedDescription = { title: "updated", description: "new", author: "new" };
      const store = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({
        networkStatus, offlineStorage: store
      });

      const { success, failure } = await createBasicConflict(UPDATE_TASK, updatedTitle, updatedDescription, client2, true);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });
      console.log("ALL TASKS", response.data.findAllTasks);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);


      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('updated');
      expect(response.data.findAllTasks[0].description).to.equal('custom');
    });

  });

  describe('default strategy should be client wins', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedBoth = { title: "client wins", description: "updated", author: "new" };
      const store2 = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure } = await createBasicConflict(UPDATE_TASK, updatedTitle, updatedBoth, client2);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      console.log("ALL TASKS", response.data.findAllTasks);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('client wins');
      expect(response.data.findAllTasks[0].description).to.equal('updated');
    });

  });

  describe('multiple offline conflicts should be resolved', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedDescription = { title: "new", description: "updated", author: "new" };

      const store2 = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure } = await createAdvancedClientConflict(UPDATE_TASK, updatedTitle, updatedDescription, client2);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      console.log("ALL TASKS", response.data.findAllTasks);

      expect(success).to.equal(2);
      expect(failure).to.equal(0);

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('updated');
      expect(response.data.findAllTasks[0].description).to.equal('updated');
      expect(response.data.findAllTasks[0].author).to.equal('Advanced conflict author');
    });

  });

  describe('offline conflict should not be affected by multiple server edits', function () {

    it('should succeed', async function () {
      const updatedTitle = { title: "updated", description: "new", author: "new" };
      const updatedDescription = { title: "new", description: "updated", author: "new" };

      const store2 = new TestStore();
      const networkStatus = newNetworkStatus();

      const client2 = await newClient({ networkStatus, offlineStorage: store2 });
      const { success, failure } = await createAdvancedServerConflict(UPDATE_TASK, updatedTitle, updatedDescription, client2);

      const response = await client.query({
        query: FIND_ALL_TASKS,
        fetchPolicy: 'network-only'
      });

      console.log("ALL TASKS", response.data.findAllTasks);

      expect(success).to.equal(1);
      expect(failure).to.equal(0);

      expect(response.data.findAllTasks).to.exist;
      expect(response.data.findAllTasks.length).to.equal(1);
      expect(response.data.findAllTasks[0].title).to.equal('updated');
      expect(response.data.findAllTasks[0].description).to.equal('updated');
      expect(response.data.findAllTasks[0].author).to.equal('Advanced conflict author');
    });

  });
});
