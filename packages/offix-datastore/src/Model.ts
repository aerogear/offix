import { Storage, StoreChangeEvent, DatabaseEvents } from "./storage";
import { createPredicate, Predicate } from "./predicates";
import { IReplicator } from "./replication";

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
 * Model Config options
 */
export interface ModelConfig<T = unknown> {
    name: string,
    storeName?: string,
    fields: Fields<T>,
    predicate?: Predicate<T>,
}

/**
 * Provides CRUD capabilities for a model
 */
export class Model<T = unknown> {
    private name: string;
    private storeName: string;
    private fields: Fields<T>;
    private getStorage: () => Storage;

    constructor(
        config: ModelConfig<T>,
        getStorage: () => Storage,
        replicator?: IReplicator
    ) {
        this.name = config.name;
        this.storeName = config.storeName || `user_${config.name}`;
        this.fields = config.fields;
        this.getStorage = getStorage;

        if(replicator) { this.getDelta(replicator, config.predicate); }
        // TODO remove ReplicationEngine 
        // and push changes to replicator from change methods(CUD) here instead
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

    private async getDelta(replicator: IReplicator, predicate?: Predicate<T>) {
        // TODO limit the size of data returned
        const data = await replicator.pullDelta(this.name, "", predicate);

        data
        .filter((d: any) => (d._deleted))
        .forEach((d: any) => this.remove((p: any) => p.id("eq", d.id)))

        data
        .filter((d: any) => (!d._deleted))
        .forEach(async (d: any) => {
            // TODO Predicate Matcher should be defined in config by user
            const results = await this.update(d, (p: any) => p.id("eq", d.id));
            if (results.length === 0) {
                // no update was made, save the data instead
                this.save(d);
                return;
            }
        });
        // TODO consider removing older data if local db surpasses size limit
    }
}
