import "fake-indexeddb/auto";
import "cross-fetch/polyfill";
import { MockNetworkStatus } from "./mock/MockNetworkStatus";
import { MockStore } from "./mock/MockStore";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloOfflineClient } from "../src";
import gql from "graphql-tag";

const link = new HttpLink({ uri: "http://example.com/graphql" });

it("base should be correctly calculated with regular id field", async function() {
  const store = new MockStore();
  const networkStatus = new MockNetworkStatus();
  networkStatus.setOnline(false);

  const cache = new InMemoryCache();
  const client = new ApolloOfflineClient({ link, cache, networkStatus, offlineStorage: store });
  await client.init();

  const newTask = {
    id: "1",
    description: "new",
    title: "new",
    version: 1,
    author: "new",
    __typename: "Task"
  };

  // @ts-ignore
  const id = cache.config.dataIdFromObject(newTask) as any;

  cache.writeData({ id , data: newTask });

  const ADD_TASK_MUTATION = gql`mutation updateTask($id: ID, $description: String, $title: String, $version: String, $author: String) {
    updateTask(id: $id, description: $description, title: $title, version: $version, author: $author) {
      id
      description
      title
      version
      author
    }
  }`;

  try {
    await client.offlineMutate({
      mutation: ADD_TASK_MUTATION,
      variables: {
        id: "1",
        description: "updated",
        title: "updated",
        author: "updated",
        version: 1
      },
      returnType: "Task"
    });
  } catch (e) {
    const operationInQueue = client.queue.queue[0].operation.op;
    expect(operationInQueue.context.conflictBase).toEqual(newTask);
  }
});

it("base should be correctly calculated with custom id field", async function() {
  const store = new MockStore();
  const networkStatus = new MockNetworkStatus();
  networkStatus.setOnline(false);

  // Tell the cache to use a custom ID
  const customDataIdFromObject = (data: any) => {
    return `${data.__typename}:${data.uuid}`;
  };

  const cache = new InMemoryCache({ dataIdFromObject: customDataIdFromObject });
  const client = new ApolloOfflineClient({ link, cache, networkStatus, offlineStorage: store });
  await client.init();

  const newTask = {
    uuid: "1",
    description: "new",
    title: "new",
    version: 1,
    author: "new",
    __typename: "Task"
  };

  // @ts-ignore
  const id = cache.config.dataIdFromObject(newTask) as any;

  cache.writeData({ id , data: newTask });

  const ADD_TASK_MUTATION = gql`mutation updateTask($uuid: ID, $description: String, $title: String, $version: String, $author: String) {
    updateTask(uuid: $id, description: $description, title: $title, version: $version, author: $author) {
      uuid
      description
      title
      version
      author
    }
  }`;

  try {
    await client.offlineMutate({
      mutation: ADD_TASK_MUTATION,
      variables: {
        uuid: "1",
        description: "updated",
        title: "updated",
        author: "updated",
        version: 1
      },
      returnType: "Task",
      idField: "uuid"
    });
  } catch (e) {
    const operationInQueue = client.queue.queue[0].operation.op;
    expect(operationInQueue.context.conflictBase).toEqual(newTask);
  }
});

it("base should be correctly calculated with if custom id is non stanard", async function() {
  const store = new MockStore();
  const networkStatus = new MockNetworkStatus();
  networkStatus.setOnline(false);

  // Tell the cache to use a custom ID
  const customDataIdFromObject = (data: any) => {
    return `foo-${data.__typename}-${data.uuid}`;
  };

  const cache = new InMemoryCache({ dataIdFromObject: customDataIdFromObject });
  const client = new ApolloOfflineClient({ link, cache, networkStatus, offlineStorage: store });
  await client.init();

  const newTask = {
    uuid: "1",
    description: "new",
    title: "new",
    version: 1,
    author: "new",
    __typename: "Task"
  };

  // @ts-ignore
  const id = cache.config.dataIdFromObject(newTask) as any;

  cache.writeData({ id , data: newTask });

  const ADD_TASK_MUTATION = gql`mutation updateTask($uuid: ID, $description: String, $title: String, $version: String, $author: String) {
    updateTask(uuid: $id, description: $description, title: $title, version: $version, author: $author) {
      uuid
      description
      title
      version
      author
    }
  }`;

  try {
    await client.offlineMutate({
      mutation: ADD_TASK_MUTATION,
      variables: {
        uuid: "1",
        description: "updated",
        title: "updated",
        author: "updated",
        version: 1
      },
      returnType: "Task",
      idField: "uuid"
    });
  } catch (e) {
    const operationInQueue = client.queue.queue[0].operation.op;
    expect(operationInQueue.context.conflictBase).toEqual(newTask);
  }
});
