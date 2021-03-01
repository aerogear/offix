import { DataStore } from "offix-datastore";
import { schema, User, Todo } from "./generated";

export const datastore = new DataStore({
  dbName: "offix-datasync",
  replicationConfig: {
    client: {
      url: "http://localhost:5400/graphql",
      wsUrl: "ws://localhost:5400/graphql"
    },
    delta: { enabled: true, pullInterval: 20000 },
    mutations: { enabled: true },
    liveupdates: { enabled: true }
  }
});

export const TodoModel = datastore.setupModel<Todo>(schema.Todo);
export const UserModel = datastore.setupModel<User>(schema.User);

datastore.init();

// After init we can start replication immediately with:
// datastore.startReplication()
// Or we can start replication at a later stage.
//
// we can also execute operations freely using hooks in components and plain js.
// const user = { name: "User" + new Date().getTime() };
// UserModel.save(user).then(async (result) => {
//   result.name = "NewUser";
//   await UserModel.updateById(result);
//   await UserModel.removeById(result.id as string);
// }).catch(console.log)
