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
    const finalId = `client:`;
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
