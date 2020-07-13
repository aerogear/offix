import { PushStream, ObservablePushStream } from "../utils/PushStream";
import { PredicateFunction } from "../predicates";
import { createDefaultStorage } from "./adapters/defaultStorage";
import { generateId } from "./core";
import { Model } from "../Model";

/**
 * This interface defines the API that is required
 * from any device specific storage implementation.
 * It defines a CRUD interface that a
 * device specific implementation must support.
*/
export interface IStorageAdapter {
    /**
     * Saves data to the Store
     *
     * @param storeName The name of the store
     * @param input The data to be saved
     * @returns A Promise of the saved data
     */
    save(storeName: string, input: any): Promise<any>;

    /**
     * Queries data from the store matching the predicate.
     * Returns all the data if predicate is not specified
     *
     * @param storeName The name of the store
     * @param predicate A PredicateFunction to filter data
     * @returns A Promise of the query results
     */
    query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;

    /**
     * Update data matching predicate or all data if predicate is not specified
     * with input.
     *
     * @param storeName The name of the store
     * @param input The update to be made
     * @param predicate A PredicateFunction to filter data
     * @returns A Promise of the updated data
     */
    update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any>;

    /**
     * Deletes data matching predicate or all from the store
     *
     * @param storeName The name of the store
     * @param predicate A PredicateFunction to filter data
     * @returns A Promise of the deleted data
     */
    remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;
}

/**
 * The various change events that can occur on Local Database
 */
export enum DatabaseEvents {
    /**
     * Data was added to the local database
     */
    ADD = "ADD",

    /**
     * Data was updated in the local database
     */
    UPDATE = "UPDATE",

    /**
     * Data was deleted from local database
     */
    DELETE = "DELETE"
}

/**
 * StoreChangeEvent is an event emitted whenever
 * a change has occurred on the local store
*/
export interface StoreChangeEvent {
    /**
     * The type of change event that just occurred
     */
    eventType: DatabaseEvents;

    /**
     * The data that was affected by the change
     */
    data: any;

    /**
     * The name store that was changed
     */
    storeName: string;
}

// TODO rename - to generic name
export class Storage {
    public readonly storeChangeEventStream: PushStream<StoreChangeEvent>;
    private adapter: IStorageAdapter;

    constructor(dbName: string, models: Model[], schemaVersion: number) {
        this.storeChangeEventStream = new ObservablePushStream();
        this.adapter = createDefaultStorage(dbName, models, schemaVersion);
    }

    public async save(storeName: string, input: any): Promise<any> {
        const result = await this.adapter.save(storeName, { id: generateId(), ...input });
        this.storeChangeEventStream.push({
            // TODO replace for enums
            eventType: DatabaseEvents.ADD,
            data: result,
            storeName
        });
        return result;
    }

    public query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
        return this.adapter.query(storeName, predicate);
    }

    public async update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any> {
        const result = await this.adapter.update(storeName, input, predicate);
        this.storeChangeEventStream.push({
            eventType: DatabaseEvents.UPDATE,
            data: result,
            storeName
        });
        return result;
    }

    public async remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
        const result = await this.adapter.remove(storeName, predicate);
        this.storeChangeEventStream.push({
            eventType: DatabaseEvents.DELETE,
            data: result,
            storeName
        });
        return result;
    }
}
