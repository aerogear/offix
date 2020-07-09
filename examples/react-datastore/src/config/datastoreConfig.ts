import { DataStore } from 'offix-datastore';

const datastore = new DataStore({
    dbName: "offix-datastore",
    url: "http://localhost:4000/graphql"
});

export const TodoModel = datastore.createModel("Todo", "user_Todo", {
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
});

datastore.init();
