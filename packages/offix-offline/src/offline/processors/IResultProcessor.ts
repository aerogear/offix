import { FetchResult } from "apollo-link";
import { QueueEntry } from "../OfflineQueue";

/**
 * Interface that can be used to perform operation on result data for offline queue.
 *
 * @see IDProcessor
 */
export interface IResultProcessor<T> {

    /**
     * Process operation and queue
     *
     * @param queue
     * @param op
     * @param result
     */
    execute(queue: QueueEntry<T>[], op: QueueEntry<T>, result: FetchResult<any>): void;
}
