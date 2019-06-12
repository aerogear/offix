import { createOptimisticResponse, OptimisticOptions } from "../src";
import { CacheOperation } from "../src/cache";
import { expect, should } from "chai";
import { CREATE_ITEM, GET_ITEMS } from "./mock/mutations";

describe("Optimistic Response tests", () => {

  it("check createNewOptimisticResponse", () => {
    const options: OptimisticOptions = {
      mutation: CREATE_ITEM,
      operationType: CacheOperation.ADD,
      returnType: "Test",
      variables: {
        name: "test"
      }
    };
    const result = createOptimisticResponse(options);
    expect(result.createItem.__typename).eq("Test");
    expect(result.createItem.name).eq("test");
  });

  it("check createNewOptimisticResponse without id", () => {
    const options: OptimisticOptions = {
      mutation: CREATE_ITEM,
      operationType: CacheOperation.REFRESH,
      returnType: "Test",
      variables: {
        name: "test"
      }
    };
    const result = createOptimisticResponse(options);
    expect(result.createItem.__typename).eq("Test");
    expect(result.createItem.name).eq("test");
    should().not.exist(result.createItem.id);
  });
});
