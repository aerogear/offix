import { CRUDEvents } from "../../storage";
import { Predicate } from "../../predicates";
import Observable from "zen-observable";
import { GraphQLClientReponse } from "./GraphQLClient";

/**
 * Operation to be pushed to Server
 */
export interface IOperation {
    eventType: CRUDEvents;
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
    push<T>(operation: IOperation): Promise<GraphQLClientReponse<T>>;

    /**
     * Pull changes from server since lastSync
     */
    pullDelta<T>(storeName: string, lastSync: string, predicate?: Predicate<T>): Promise<GraphQLClientReponse<T>>;

    /**
     * Subscribe to the changes on the server
     */
    subscribe<T>(storeName: string, eventType: CRUDEvents,  predicate?: Predicate<T>): Observable<T>;
}
