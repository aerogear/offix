import { DataStore } from 'offix-datastore';
import { schema } from './schema';
import { ITodo } from '../types';

export const datastore = new DataStore({
  dbName: "offix-datasync",
  replicationConfig: {
    client: {
      url: "http://localhost:5400/graphql",
      wsUrl: "ws://localhost:5400/graphql",
    },
    delta: { enabled: true, pullInterval: 3000 },
    mutations: { enabled: true },
    liveupdates: { enabled: true }
  }
});

export const TodoModel = datastore.setupModel<ITodo>(schema.Todo);

datastore.init();
