import { Storage, StoreChangeEvent, EventTypes } from "./storage";
import { createPredicate, Predicate } from "./predicates";

export interface FieldOptions {
    /** GraphQL type */
    type: string;
    /** GraphQL key */
    key: string;
    // TODO
    format?: {  };
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
export class Model<T> {
    private storeName: string;
    private fields: Fields<T>;
    private getStorage: () => Storage;

    constructor(
        storeName: string,
        fields: Fields<T>,
        getStorage: () => Storage
    ) {
        this.storeName = storeName;
        this.fields = fields;
        this.getStorage = getStorage;
    }

    public save(input: T): Promise<T> {
        return this.getStorage().save(this.storeName, input);
    }

    public query(predicateFunction?: Predicate<T>) {
        if (!predicateFunction) {return this.getStorage().query(this.storeName);}

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
        if (!predicateFunction) {return this.getStorage().remove(this.storeName);}

        const modelPredicate = createPredicate(this.fields);
        const predicate = predicateFunction(modelPredicate);
        return this.getStorage().remove(this.storeName, predicate);
    }

    // TODO fix event listening
    public on(event: EventTypes, listener: (event: StoreChangeEvent) => void) {
        return this.getStorage().storeChangeEventStream.subscribe(listener);
    }
}
