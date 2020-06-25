import { PushStream, ObservablePushStream } from "../utils/PushStream";
import { PredicateFunction } from "../predicates";
import { createDefaultStorage } from "./adapters/defaultStorage";
import { generateId } from "./core";

/**
 * This interface defines the API that is required
 * from any Device specific Storage implementation
 * It defines a CRUD interface that a
 * Device Specific Implementation must support
*/
export interface IStorageAdapter {
    save(storeName: string, input: any): Promise<any>;
    query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;
    update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any>;
    remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;
}

/**
 * The various change events that can occur on Store
 *
 * "ADD" - data was added to the Store
 * "UPDATE" - data was updated in the Store
 * "DELETE" - data was deleted from the Store
 */
export type EventTypes = "ADD" | "UPDATE" | "DELETE";

/**
 * StoreChangeEvent is an event emitted whenever
 * a change has occurred on the local store
*/
export interface StoreChangeEvent {
    // the type of change event that just occurred
    eventType: EventTypes;
    // the data that was affected by the change
    data: any;
}

export class Storage {
    public readonly storeChangeEventStream: PushStream<StoreChangeEvent>;
    private adapter: IStorageAdapter;

    constructor(dbName: string, storeNames: string[], schemaVersion: number) {
        this.storeChangeEventStream = new ObservablePushStream();
        this.adapter = createDefaultStorage(dbName, storeNames, schemaVersion);
    }

    public async save(storeName: string, input: any): Promise<any> {
        const result = await this.adapter.save(storeName, { ...input, id: generateId() });
        this.storeChangeEventStream.push({
            eventType: "ADD",
            data: result
        });
        return result;
    }

    public query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
        return this.adapter.query(storeName, predicate);
    }

    public async update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any> {
        const result = await this.adapter.update(storeName, input, predicate);
        this.storeChangeEventStream.push({
            eventType: "UPDATE",
            data: result
        });
        return result;
    }

    public async remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
        const result = await this.adapter.remove(storeName, predicate);
        this.storeChangeEventStream.push({
            eventType: "DELETE",
            data: result
        });
        return result;
    }
}
