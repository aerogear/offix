import { Storage, StoreChangeEvent, EventTypes } from "./storage";
import { createPredicate } from "./predicates";

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T> {
    private storeName: string;
    private fields: any;
    private getStorage: () => Storage;

    constructor(
        storeName: string,
        fields: any,
        getStorage: () => Storage
    ) {
        this.storeName = storeName;
        this.fields = fields;
        this.getStorage = getStorage;
    }

    public save(input: T): Promise<T> {
        return this.getStorage().save(this.storeName, input);
    }

    public query(predicateFunction?: Function) {
        if (!predicateFunction) {return this.getStorage().query(this.storeName);}

        const modelPredicate = createPredicate(this.fields);
        const predicate = predicateFunction(modelPredicate);
        return this.getStorage().query(this.storeName, predicate);
    }

    public update(input: Partial<T>) {
        return this.getStorage().update(this.storeName, input);
    }

    public remove(predicateFunction?: Function) {
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
