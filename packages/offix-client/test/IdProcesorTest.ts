import { IDProcessor } from "../src/offline/procesors/IDProcessor";
import { OperationQueueEntry } from "../src/offline/OperationQueueEntry";
import { expect } from "chai";

describe("IdProcessor", () => {
    const idProcessor = new IDProcessor();

    it("Process id without change", () => {
        const finalId = "test:1";
        const exampleOperation = {
            operationName: "test", variables: { id: finalId },
            getContext: () => {
                return {
                    optimisticResponse: { test: { id: finalId } }
                };
            }
        };
        const entry = new OperationQueueEntry(exampleOperation as any, 1);
        const queued = new OperationQueueEntry(exampleOperation as any, 2);
        idProcessor.execute([queued], entry, { data: { test: { id: "notApplied:1" } } });
        expect(exampleOperation.variables.id).equal(finalId);

    });

    it("Process without change", () => {
        const finalId = `client:`;
        const exampleOperation = {
            operationName: "test", variables: { id: finalId },
            getContext: () => {
                return {
                    optimisticResponse: { test: { id: finalId } }
                };
            }
        };
        const entry = new OperationQueueEntry(exampleOperation as any, 1);
        const queued = new OperationQueueEntry(exampleOperation as any, 2);
        idProcessor.execute([queued], entry, { data: { test: { id: "applied:1" } } });
        expect(exampleOperation.variables.id).equal("applied:1");
    });

});
