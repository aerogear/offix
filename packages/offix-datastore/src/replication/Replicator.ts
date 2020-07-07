import { EventTypes } from "../storage";

export interface IReplicationResponse {
    data: unknown;
    errors: unknown[];
}

/**
 * Operation to be pushed to Server
 */
export interface IOperation {
    eventType: EventTypes;
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
}
