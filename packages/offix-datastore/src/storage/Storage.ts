import { PushStream, ObservablePushStream } from "../utils/PushStream";
import { Model, PersistedModel } from "../models";
import { PredicateFunction } from "../predicates";
import { createDefaultStorage } from "./adapters/defaultStorage";
import { generateId } from "./core";

export interface IStorageAdapter {
    save(model: PersistedModel): Promise<PersistedModel>;
    query(modelName: string, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]>;
    update(model: PersistedModel): Promise<PersistedModel>;
    remove(model: PersistedModel, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]>;
}

export interface StoreChangeEvent {
    operationType: string;
    data: any;
}

export class Storage {
    public readonly storeChangeEventStream: PushStream<StoreChangeEvent>;
    private adapter: IStorageAdapter;

    constructor(models: Model[], schemaVersion: number) {
        this.storeChangeEventStream = new ObservablePushStream();
        this.adapter = createDefaultStorage(models, schemaVersion);
    }

    async save(model: Model): Promise<PersistedModel> {
        const persistedModel = { ...model, id: generateId() };
        const result = await this.adapter.save(persistedModel);
        this.storeChangeEventStream.push({
            operationType: "ADD",
            data: result
        });
        return result;
    }

    query(modelName: string, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]> {
        return this.adapter.query(modelName, predicate);
    }

    async update(model: PersistedModel): Promise<PersistedModel> {
        const result = await this.adapter.update(model);
        this.storeChangeEventStream.push({
            operationType: "UPDATE",
            data: result
        });
        return result;
    }

    async remove(model: PersistedModel, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]> {
        const result = await this.adapter.remove(model, predicate);
        this.storeChangeEventStream.push({
            operationType: "DELETE",
            data: result
        });
        return result;
    }
}
