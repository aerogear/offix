import { IResultProcessor } from "../offline/processors/IResultProcessor";
import { OperationQueueEntry } from "../offline/OperationQueueEntry";
import { ObjectState } from "./state/ObjectState";
import { FetchResult } from "apollo-link";

/**
 * Manipulate state of item that is being used for conflict resolution purposes.
 * This is required for the queue items so that we do not get a conflict with ourself
 * @param entry the operation which returns the result we compare with first queue entry
 */
export class ConflictProcessor implements IResultProcessor {
    constructor(private state: ObjectState) {
    }

    public execute(queue: OperationQueueEntry[],
        entry: OperationQueueEntry, result: FetchResult): void {
        const { operation: { operationName } } = entry;
        if (!result || !this.state) {
            return;
        }

        if (result.data && result.data[operationName]) {
            for (const { operation: op } of queue) {
                if (op.variables.id === entry.operation.variables.id
                    && op.operationName === entry.operation.operationName) {
                    this.state.assignServerState(op.variables, result.data[operationName])
                }
            }
        }
    }
}
