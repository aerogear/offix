import { createOptimisticResponse, OptimisticOptions } from "../src";
import { CacheOperation } from "../src/cache";
import { CREATE_ITEM } from "./mock/mutations";

test("check that createNewOptimisticResponse is properly composed with __typename property", () => {
  const options: OptimisticOptions = {
    mutation: CREATE_ITEM,
    operationType: CacheOperation.ADD,
    returnType: "Test",
    variables: {
      name: "test"
    }
  };
  const result = createOptimisticResponse(options);
  expect(result.createItem.__typename).toBe("Test");
});

test("check that createNewOptimisticResponse is properly composed with name property", () => {
  const options: OptimisticOptions = {
    mutation: CREATE_ITEM,
    operationType: CacheOperation.ADD,
    returnType: "Test",
    variables: {
      name: "test"
    }
  };
  const result = createOptimisticResponse(options);
  expect(result.createItem.name).toBe("test");
});

test("check that createNewOptimisticResponse is without id", () => {
  const options: OptimisticOptions = {
    mutation: CREATE_ITEM,
    operationType: CacheOperation.REFRESH,
    returnType: "Test",
    variables: {
      name: "test"
    }
  };
  const result = createOptimisticResponse(options);
  expect(result.createItem.id).toBe(undefined);
});
