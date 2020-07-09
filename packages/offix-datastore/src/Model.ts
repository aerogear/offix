import { Storage, StoreChangeEvent, DatabaseEvents } from "./storage";
import { createPredicate, Predicate } from "./predicates";

export interface FieldOptions {
    /** GraphQL type */
    type: string;
    /** GraphQL key */
    key: string;
    // TODO
    format?: {};
}

/**
 * Defines the properties expected in the Fields object for a model
 */
export type Fields<T> = {
    [P in keyof T]: FieldOptions
};

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T = unknown> {
    private name: string;
    private storeName: string;
    private fields: Fields<T>;
    private getStorage: () => Storage;

    constructor(
        name: string,
        storeName: string,
        fields: Fields<T>,
        getStorage: () => Storage
    ) {
        this.name = name;
        this.storeName = storeName;
        this.fields = fields;
        this.getStorage = getStorage;
    }

    public getFields() {
        return this.fields;
    }

    public getName() {
        return this.name;
    }

    public getStoreName() {
        return this.storeName;
    }

    public save(input: T): Promise<T> {
        return this.getStorage().save(this.storeName, input);
    }

    public query(predicateFunction?: Predicate<T>) {
        if (!predicateFunction) { return this.getStorage().query(this.storeName); }

        const modelPredicate = createPredicate(this.fields);
        const predicate = predicateFunction(modelPredicate);
        return this.getStorage().query(this.storeName, predicate);
    }

    public update(input: Partial<T>, predicateFunction?: Predicate<T>) {
        if (!predicateFunction) {
            return this.getStorage().update(this.storeName, input);
        }

        const modelPredicate = createPredicate(this.fields);
        const predicate = predicateFunction(modelPredicate);
        return this.getStorage().update(this.storeName, input, predicate);
    }

    public remove(predicateFunction?: Predicate<T>) {
        if (!predicateFunction) { return this.getStorage().remove(this.storeName); }

        const modelPredicate = createPredicate(this.fields);
        const predicate = predicateFunction(modelPredicate);
        return this.getStorage().remove(this.storeName, predicate);
    }

    // TODO add seed and reset - investigate.

    public on(eventType: DatabaseEvents, listener: (event: StoreChangeEvent) => void) {
        return this.getStorage()
            .storeChangeEventStream.subscribe((event) => {
                if (event.eventType !== eventType) { return; }
                listener(event);
            });
    }
}
