import { expect, should } from "chai";
import { CacheOperation, createMutationOptions, createSubscriptionOptions } from "../src/cache";
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
import { mock } from "fetch-mock";
import { storage } from "./mock/Storage";
import { networkStatus } from "./mock/NetworkState";

const url = "http://testCache";

describe("CacheHelpers", () => {

  const builtCreateOptions = createMutationOptions({
    mutation: CREATE_ITEM,
    variables: {
      "title": "new item"
    },
    updateQuery: GET_ITEMS,
    typeName: "Item",
    operationType: CacheOperation.ADD,
    idField: "id"
  });
  const builtDeleteOptions = createMutationOptions({
    mutation: DELETE_ITEM,
    variables: {
      "id": "5"
    },
    updateQuery: GET_ITEMS,
    typeName: "Item",
    operationType: CacheOperation.DELETE,
    idField: "id"
  });
  const builtOptionsWithArray = createMutationOptions({
    mutation: CREATE_LIST,
    variables: {
      "title": "new list"
    },
    updateQuery: [{ query: GET_ITEMS, variables: {} }, { query: GET_LISTS, variables: {} }],
    typeName: "List",
    operationType: CacheOperation.ADD,
    idField: "id"
  });
  const builtNonExistent = createMutationOptions({
    mutation: DOESNT_EXIST,
    variables: {
      "title": "new list"
    },
    updateQuery: { query: GET_NON_EXISTENT, variables: {} },
    typeName: "Something",
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

  const createNonExistent = (id: string) => {
    if (builtNonExistent && builtNonExistent.update) {
      builtNonExistent.update(client.cache, {
        data: {
          "somethingFake": {
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

  before(() => {
    mock(url, 200);
  });

  beforeEach(async () => {
    const offlineClient = new OfflineClient({ httpUrl: url, storage, networkStatus });
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

  it("ensures built mutation options include a function", () => {
    should().exist(builtCreateOptions.update);
    expect(typeof (builtCreateOptions.update)).to.eq("function");
  });

  it("add item to cache", () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(0);
    create("1");
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(1);
  });

  it("add item to cache with multiple", () => {
    expect(client.readQuery({ query: GET_LISTS }).allLists).to.have.length(0);
    createList("1");
    expect(client.readQuery({ query: GET_LISTS }).allLists).to.have.length(1);
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(1);
  });

  it("delete item from cache", async () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(0);
    create("1");
    create("2");
    create("3");
    remove("2");
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(2);
    expect(client.readQuery({ query: GET_ITEMS }).allItems[1].id).eq("3");
  });

  it("delete multiple items from cache", async () => {
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(0);
    create("1");
    create("2");
    create("3");
    remove("2");
    remove("3");
    expect(client.readQuery({ query: GET_ITEMS }).allItems).to.have.length(1);
  });

  it("ensures built subscription options include a function", async () => {
    should().exist(builtSubCreateOptions.updateQuery);
    expect(typeof (builtSubCreateOptions.updateQuery)).to.eq("function");
  });

  it("ensures new addition appends to empty array", async () => {
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
      expect(result.allItems).to.have.length(1);
    }
  });

  it("ensures new addition appends to array", async () => {
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
      expect(result.allItems).to.have.length(3);
    }
  });

  it("ensures update edits entry in array", async () => {
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
      expect(result.allItems).to.have.length(3);
      expect(result.allItems[0].title).to.eq("item 1");
      expect(result.allItems[1].title).to.eq("item 2 updated");
      expect(result.allItems[2].title).to.eq("item 3");
    }
  });

  it("sending empty update object is safe", async () => {
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
      expect(result.allItems).to.have.length(3);
      expect(result.allItems[0].title).to.eq("item 1");
      expect(result.allItems[1].title).to.eq("item 2");
      expect(result.allItems[2].title).to.eq("item 3");
    }
  });

  it("can't edit non existent object", async () => {
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
      expect(result.allItems).to.have.length(3);
      expect(result.allItems[0].title).to.eq("item 1");
      expect(result.allItems[1].title).to.eq("item 2");
      expect(result.allItems[2].title).to.eq("item 3");
    }
  });

  it("ensures deletion removes entry safely", async () => {
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
      expect(result.allItems).to.have.length(2);
      expect(result.allItems[0].title).to.eq("item 1");
      expect(result.allItems[1].title).to.eq("item 3");
    }
  });

  it("can't delete non existent item", async () => {
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
      expect(result.allItems).to.have.length(3);
    }
  });

  it("sending empty delete object is safe", async () => {
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
      expect(result.allItems).to.have.length(3);
    }
  });
});
