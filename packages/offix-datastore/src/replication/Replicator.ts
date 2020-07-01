import { StoreChangeEvent } from "../storage";

export interface IReplicationResponse {
    data: unknown;
    errors: unknown[];
}

/**
 * Push and pulls changes to and from server
 */
export interface IReplicator {
    /**
     * Push changes to server with replication support
     * 
     * @param event
     * @param modelName 
     */
    push(event: StoreChangeEvent): Promise<IReplicationResponse>
}
