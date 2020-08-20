import { DataStore, SQLiteAdapter } from 'offix-datastore';
import { NativeNetworkStatus } from './network/NativeNetworkStatus';
// import { SQLiteAdapter } from './sqlite/SQLiteAdapter';
import { schema } from './generated';
import { IUser, ITodo } from './generated/types';

export const datastore = new DataStore({
  dbName: "offix-datasync",
  replicationConfig: {
    client: {
      url: "http://localhost:5400/graphql",
      wsUrl: "ws://localhost:5400/graphql",
    },
    networkStatus: new NativeNetworkStatus(),
    delta: { enabled: true, pullInterval: 20000 },
    mutations: { enabled: true },
    liveupdates: { enabled: true }
  }
}, {
  storeAdapter: new SQLiteAdapter("offixdb", 1)
});

export const TodoModel = datastore.setupModel<ITodo>(schema.Todo);
export const UserModel = datastore.setupModel<IUser>(schema.User);

datastore.init();

// After init we can execute operations frely using hooks in components and plain js.
// const user = { name: "User" + new Date().getTime() };
// UserModel.save(user).then(async (result) => {
//   result.name = "NewUser";
//   await UserModel.updateById(result);
//   await UserModel.removeById(result.id as string);
// }).catch(console.log)
