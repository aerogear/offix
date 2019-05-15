import { createOptimisticResponse } from "../src";
import { MutationHelperOptions, CacheOperation } from "../src/cache";
import { expect, should } from "chai";
import { CREATE_ITEM, GET_ITEMS } from "./mock/mutations";

describe("Optimistic Response tests", () => {

  it("check createNewOptimisticResponse", () => {
    const options: MutationHelperOptions = {
      mutation: CREATE_ITEM,
      operationType: CacheOperation.ADD,
      typeName: "Test",
      variables: {
        name: "test"
      },
      updateQuery: GET_ITEMS
    };
    const result = createOptimisticResponse(options);
    expect(result.createItem.__typename).eq("Test");
    expect(result.createItem.name).eq("test");
  });

  it("check createNewOptimisticResponse without id", () => {
    const options: MutationHelperOptions = {
      mutation: CREATE_ITEM,
      operationType: CacheOperation.REFRESH,
      typeName: "Test",
      variables: {
        name: "test"
      },
      updateQuery: GET_ITEMS
    };
    const result = createOptimisticResponse(options);
    expect(result.createItem.__typename).eq("Test");
    expect(result.createItem.name).eq("test");
    should().not.exist(result.createItem.id);
  });
});
