import { DatabaseEvents } from "../storage";
import { Predicate } from "../predicates";

export interface IReplicationResponse {
    data: unknown;
    errors: unknown[];
}

/**
 * Operation to be pushed to Server
 */
export interface IOperation {
    eventType: DatabaseEvents;
    input: any;
    storeName: string;
}

/**
 * Push and pulls changes to and from server
 */
export interface IReplicator {
    /**
     * Push changes to server with replication support
     *
     * @param operation
     */
    push(operation: IOperation): Promise<IReplicationResponse>;

    /**
     * Pull changes from server since lastSync
     */
    pullDelta<T>(modelName: string, lastSync: string, predicate?: Predicate<T>): Promise<T[]>;
}
