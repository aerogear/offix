import "fake-indexeddb/auto";
import "cross-fetch/polyfill";

import { CacheOperation, createMutationOptions, createSubscriptionOptions } from "../../offix-cache/src/cache";
import {
  CREATE_ITEM,
  GET_ITEMS,
  GET_LISTS,
  DELETE_ITEM,
  ITEM_CREATED_SUB,
  ITEM_DELETED_SUB,
  ITEM_UPDATED_SUB,
  CREATE_LIST,
  DOESNT_EXIST,
  GET_NON_EXISTENT
} from "./mock/mutations";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { OfflineClient } from "../src";
import ApolloClient from "apollo-client";

const url = "http://testCache";

  const builtCreateOptions = createMutationOptions({
    mutation: CREATE_ITEM,
    variables: {
      "title": "new item"
    },
    updateQuery: GET_ITEMS,
    returnType: "Item",
    operationType: CacheOperation.ADD,
    idField: "id"
  });
  const builtDeleteOptions = createMutationOptions({
    mutation: DELETE_ITEM,
    variables: {
      "id": "5"
    },
    updateQuery: GET_ITEMS,
    returnType: "Item",
    operationType: CacheOperation.DELETE,
    idField: "id"
  });
  const builtOptionsWithArray = createMutationOptions({
    mutation: CREATE_LIST,
    variables: {
      "title": "new list"
    },
    updateQuery: [{ query: GET_ITEMS, variables: {} }, { query: GET_LISTS, variables: {} }],
    returnType: "List",
    operationType: CacheOperation.ADD,
    idField: "id"
  });
  const builtNonExistent = createMutationOptions({
    mutation: DOESNT_EXIST,
    variables: {
      "title": "new list"
    },
    updateQuery: { query: GET_NON_EXISTENT, variables: {} },
    returnType: "Something",
    operationType: CacheOperation.ADD,
    idField: "id"
  });
  const builtSubCreateOptions = createSubscriptionOptions({
    subscriptionQuery: ITEM_CREATED_SUB,
    cacheUpdateQuery: GET_ITEMS,
    operationType: CacheOperation.ADD
  });
  const builtSubUpdateOptions = createSubscriptionOptions({
    subscriptionQuery: ITEM_UPDATED_SUB,
    cacheUpdateQuery: GET_ITEMS,
    operationType: CacheOperation.REFRESH
  });
  const builtSubDeleteOptions = createSubscriptionOptions({
    subscriptionQuery: ITEM_DELETED_SUB,
    cacheUpdateQuery: GET_ITEMS,
    operationType: CacheOperation.DELETE
  });
  let client: ApolloClient<NormalizedCacheObject>;

  const create = (id: string) => {
    if (builtCreateOptions && builtCreateOptions.update) {
      builtCreateOptions.update(client.cache, {
        data: {
          "createItem": {
            "id": id,
            "title": "new item" + id,
            "__typename": "Item"
          }
        }
      });
    }
  };

  const createList = (id: string) => {
    if (builtOptionsWithArray && builtOptionsWithArray.update) {
      builtOptionsWithArray.update(client.cache, {
        data: {
          "createList": {
            "id": id,
            "title": "new list" + id,
            "__typename": "Item"
          }
        }
      });
    }
  };

  const remove = (id: string) => {
    if (builtDeleteOptions && builtDeleteOptions.update) {
      builtDeleteOptions.update(client.cache, {
        data: {
          "deleteItem": {
            "id": id,
            "__typename": "Item"
          }
        }
      });
    }
  };

  beforeEach(async () => {
    const offlineClient = new OfflineClient({ httpUrl: url });
    client = await offlineClient.init();
    client.writeQuery({
      query: GET_ITEMS,
      data: {
        "allItems": []
      }
    });
    client.writeQuery({
      query: GET_LISTS,
      data: {
        "allLists": []
      }
    });
  });

  test("ensures built mutation options include a function", () => {
    expect(builtCreateOptions.update).toBeDefined();
    expect(typeof (builtCreateOptions.update)).toBe("function");
  });

  test("add item to cache", () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(0);
    create("1");
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(1);
  });

  test("add item to cache with multiple", () => {
    expect(client.readQuery({ query: GET_LISTS }).allLists.length).toBe(0);
    createList("1");
    expect(client.readQuery({ query: GET_LISTS }).allLists.length).toBe(1);
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(1);
  });

  test("delete item from cache", async () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(0);
    create("1");
    create("2");
    create("3");
    remove("2");
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(2);
    expect(client.readQuery({ query: GET_ITEMS }).allItems[1].id).toBe("3");
  });

  test("delete multiple items from cache", async () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(0);
    create("1");
    create("2");
    create("3");
    remove("2");
    remove("3");
    expect(client.readQuery({ query: GET_ITEMS }).allItems.length).toBe(1);
  });

  test("ensures built subscription options include a function", async () => {
    expect(builtSubCreateOptions.updateQuery).toBeDefined();
    expect(typeof (builtSubCreateOptions.updateQuery)).toBe("function");
  });

  test("ensures new addition appends to empty array", async () => {
    if (builtSubCreateOptions && builtSubCreateOptions.updateQuery) {
      const result = builtSubCreateOptions.updateQuery(
        {
          allItems: []
        },
        {
          subscriptionData: {
            data: {
              itemAdded: { id: "1", title: "item 1" }
            }
          }
        });
      expect(result.allItems.length).toBe(1);
    }
  });

  test("ensures new addition appends to array", async () => {
    if (builtSubCreateOptions && builtSubCreateOptions.updateQuery) {
      const result = builtSubCreateOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemAdded: { id: "3", title: "item 3" }
            }
          }
        });
      expect(result.allItems.length).toBe(3);
    }
  });

  test("ensures update edits entry in array", async () => {
    if (builtSubUpdateOptions && builtSubUpdateOptions.updateQuery) {
      const result = builtSubUpdateOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemUpdated: { id: "2", title: "item 2 updated" }
            }
          }
        });
      expect(result.allItems.length).toBe(3);
      expect(result.allItems[0].title).toBe("item 1");
      expect(result.allItems[1].title).toBe("item 2 updated");
      expect(result.allItems[2].title).toBe("item 3");
    }
  });

  test("sending empty update object is safe", async () => {
    if (builtSubUpdateOptions && builtSubUpdateOptions.updateQuery) {
      const result = builtSubUpdateOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemUpdated: { id: "4", title: "item 4 updated" }
            }
          }
        });
      expect(result.allItems.length).toBe(3);
      expect(result.allItems[0].title).toBe("item 1");
      expect(result.allItems[1].title).toBe("item 2");
      expect(result.allItems[2].title).toBe("item 3");
    }
  });

  test("can't edit non existent object", async () => {
    if (builtSubUpdateOptions && builtSubUpdateOptions.updateQuery) {
      const result = builtSubUpdateOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemUpdated: {}
            }
          }
        });
      expect(result.allItems.length).toBe(3);
      expect(result.allItems[0].title).toBe("item 1");
      expect(result.allItems[1].title).toBe("item 2");
      expect(result.allItems[2].title).toBe("item 3");
    }
  });

  test("ensures deletion removes entry safely", async () => {
    if (builtSubDeleteOptions && builtSubDeleteOptions.updateQuery) {
      const result = builtSubDeleteOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemDeleted: { id: "2" }
            }
          }
        });
      expect(result.allItems.length).toBe(2);
      expect(result.allItems[0].title).toBe("item 1");
      expect(result.allItems[1].title).toBe("item 3");
    }
  });

  test("can't delete non existent item", async () => {
    if (builtSubDeleteOptions && builtSubDeleteOptions.updateQuery) {
      const result = builtSubDeleteOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemDeleted: { id: "4" }
            }
          }
        });
      expect(result.allItems.length).toBe(3);
    }
  });

  test("sending empty delete object is safe", async () => {
    if (builtSubDeleteOptions && builtSubDeleteOptions.updateQuery) {
      const result = builtSubDeleteOptions.updateQuery(
        {
          allItems: [
            { id: "1", title: "item 1" },
            { id: "2", title: "item 2" },
            { id: "3", title: "item 3" }
          ]
        },
        {
          subscriptionData: {
            data: {
              itemDeleted: {}
            }
          }
        });
      expect(result.allItems.length).toBe(3);
    }
  });
