import { replaceClientGeneratedIDsInQueue } from "../src/apollo/optimisticResponseHelpers";
import { DocumentNode } from "graphql";

test("Process id without change", () => {
  const finalId = "test:1";
  const exampleOperation = {
    mutation: {} as DocumentNode,
    variables: {
      id: finalId
    },
    optimisticResponse: { test: { id: finalId } },
    context: {
      operationName: "test"
    }
  };
  const entry = {
    operation: {
      op: exampleOperation,
      qid: "someId"
    }
  };
  const queue = [entry];
  replaceClientGeneratedIDsInQueue(queue, entry.operation, { data: { test: { id: "notApplied:1" } } });
  expect(exampleOperation.variables.id).toBe(finalId);
});

test("Process with change", () => {
  const finalId = "client:1";
  const exampleOperation = {
    mutation: {} as DocumentNode,
    variables: {
      id: finalId
    },
    optimisticResponse: { test: { id: finalId } },
    context: {
      operationName: "test"
    }
  };
  const entry = {
    operation: {
      op: exampleOperation,
      qid: "someId"
    }
  };
  const queue = [entry];
  replaceClientGeneratedIDsInQueue(queue, entry.operation, { data: { test: { id: "applied:1" } } });
  expect(exampleOperation.variables.id).toBe("applied:1");
});

test("Can handle cases where variables is a nested object", () => {
  const optimisticId = "client:1";
  const op0 = {
    operation: {
      qid: "queue:1",
      op: {
        mutation: {} as DocumentNode,
        variables: {
          someOperationInput: {
            id: optimisticId
          }
        },
        optimisticResponse: { someOperation: { id: optimisticId } },
        context: {
          operationName: "someOperation"
        }
      }
    }
  };
  const op1 = {
    operation: {
      qid: "queue:2",
      op: {
        mutation: {} as DocumentNode,
        variables: {
          anotherOperationInput: {
            id: optimisticId
          }
        },
        optimisticResponse: { anotherOperation: { id: optimisticId } },
        context: {
          operationName: "anotherOperation"
        }
      }
    }
  };
  const queue = [op0, op1];

  const op0Result = { data: { someOperation: { id: "applied:1" } } };
  replaceClientGeneratedIDsInQueue(queue, op0.operation, op0Result);
  expect(op0.operation.op.variables.someOperationInput.id).toBe("applied:1");
  expect(op1.operation.op.variables.anotherOperationInput.id).toBe("applied:1");
});

test("Can handle cases optimistic value is referenced in other keys (example: relationships)", () => {
  const op0 = {
    operation: {
      qid: "queue:1",
      op: {
        mutation: {} as DocumentNode,
        variables: {
          createExample: {
            id: "client:1"
          }
        },
        optimisticResponse: { createExample: { id: "client:1" } },
        context: {
          operationName: "createExample"
        }
      }
    }
  };
  const op1 = {
    operation: {
      qid: "queue:2",
      op: {
        mutation: {} as DocumentNode,
        variables: {
          anotherCreateExampleInput: {
            id: "client:2",
            parentId: "client:1" // references the first operation
          }
        },
        optimisticResponse: { anotherCreateExample: { id: "client:2" } },
        context: {
          operationName: "anotherCreateExample"
        }
      }
    }
  };
  const queue = [op0, op1];

  const op0Result = { data: { createExample: { id: "applied:1" } } };
  replaceClientGeneratedIDsInQueue(queue, op0.operation, op0Result);
  expect(op1.operation.op.variables.anotherCreateExampleInput.parentId).toBe("applied:1");
});
