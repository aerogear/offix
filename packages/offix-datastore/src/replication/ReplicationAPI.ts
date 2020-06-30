import { StoreChangeEvent } from "../storage";

export interface IReplicationResponse {
    data: unknown;
    errors: unknown[];
}

/**
 * Defines the 
 */
export interface IReplicationAPI {
    /**
     * Push changes to server with replication support
     * 
     * @param event
     * @param modelName 
     */
    push(event: StoreChangeEvent): Promise<IReplicationResponse>
}
