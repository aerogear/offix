import { DataStore } from 'offix-datastore';
import { schema } from './schema';

export const datastore = new DataStore({
    dbName: "offix-datasync",
    clientConfig: {
      url: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
    }
});

export const TodoModel = datastore.createModel(schema.Todo);

datastore.init();
