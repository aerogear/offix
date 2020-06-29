import { DataStore } from 'offix-datastore';

const datastore = new DataStore("offix-datastore");

export const TodoModel = datastore.create("user_Todo", {
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
