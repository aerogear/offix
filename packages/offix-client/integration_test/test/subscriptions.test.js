import { createClient } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import {
  ADD_TASK,
  GET_TASKS,
  TASK_CREATED
} from '../utils/graphql.queries';

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

describe('Subscriptions', function () {

  this.timeout(2000);

  const newTask = {
    description: 'new',
    title: 'new',
    version: 1
  };

  let client, networkStatus, store;

  before('start server', async function () {
    await server.start();
  });

  after('stop server', async function() {
    await server.stop();
  });

  beforeEach('reset server', async function () {
    await server.reset();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus(false);
    store = new TestStore();
    client = await newClient({ networkStatus, storage: store });
  });

  describe('receive notification with subscription', function () {

    it('should succeed', async function () {
      networkStatus.setOnline(true);

      const tasks = client.watchQuery({
        query: GET_TASKS,
        fetchPolicy: 'network-only'
      });
    
      tasks.subscribeToMore({
        document: TASK_CREATED,
        updateQuery: (prev, { subscriptionData }) => {
          if(subscriptionData.data){
            const newTask = subscriptionData.data.taskCreated;
            if (prev.allTasks.find(task => task.id === newTask.id)) {
              return prev;
            } else {
              return Object.assign({}, prev, {
                allTasks: [...prev.allTasks, newTask]
              });
            }
          }
        }
      });
      
      let allTasks = [];

      tasks.subscribe(result => {
        allTasks = result.data && result.data.allTasks;
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      await client.mutate({
        mutation: ADD_TASK,
        variables: newTask
      });

      expect(allTasks).to.exist;
      expect(allTasks.length).to.equal(1);
      expect(allTasks[0].title).to.equal(newTask.title);
      expect(allTasks[0].description).to.equal(newTask.description);
    });

  });

});
