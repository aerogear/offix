import { IDProcessor } from "../src/offline/processors/IDProcessor";
import { DocumentNode } from "graphql";

it("Process id without change", () => {
    const idProcessor = new IDProcessor();
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
    idProcessor.execute(queue, entry, { data: { test: { id: "notApplied:1" } } });
    expect(exampleOperation.variables.id).toBe(finalId);
});

it("Process with change", () => {
    const idProcessor = new IDProcessor();

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
    idProcessor.execute(queue, entry, { data: { test: { id: "applied:1" } } });
    expect(exampleOperation.variables.id).toBe("applied:1");
});