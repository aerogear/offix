import { createOptimisticResponse, OptimisticOptions } from "../src";
import { CacheOperation } from "../src/api/CacheOperation";
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

test("createOptimisticResponse works with an input mapper", () => {
  const options: OptimisticOptions = {
    mutation: CREATE_ITEM,
    operationType: CacheOperation.REFRESH,
    returnType: "Test",
    variables: {
      a: "val1",
      b: "val2",
      input: {
        id: "123",
        name: "test"
      }
    },
    inputMapper: (vars) => vars.input
  };
  const result = createOptimisticResponse(options);
  expect(result.createItem).toStrictEqual({
    __typename: "Test",
    id: "123",
    name: "test",
    optimisticResponse: true
  });
});
