import { DataStore } from 'offix-datastore';

export const datastore = new DataStore({
  dbName: "offix-datastore",
  clientConfig: {
    url: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
  }
});

export const TodoModel = datastore.createModel({
  name: "Todo", 
  storeName: "user_Todo", 
  fields: {
    id: {
        type: "ID",
        key: "id"
    },
    title: {
        type: "String",
        key: "title"
    },
    description: {
        type: "String",
        key: "description"
    },
    completed: {
        type: "Boolean",
        key: "completed"
    }
  }
});

datastore.init();
