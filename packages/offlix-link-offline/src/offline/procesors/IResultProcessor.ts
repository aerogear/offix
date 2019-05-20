import { FetchResult } from "apollo-link";
import { OperationQueueEntry } from "../OperationQueueEntry";
import { isClientGeneratedId } from "../..";

/**
 * Interface that can be used to perform operation on result data for offline queue.
 *
 * @see IDProcessor
 * @see ConflictProcessor
 */
export interface IResultProcessor {

    /**
     * Process operation and queue
     *
     * @param queue
     * @param op
     * @param result
     */
    execute(queue: OperationQueueEntry[], op: OperationQueueEntry, result: FetchResult<any>): void;
}
