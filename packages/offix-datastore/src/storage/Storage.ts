import { Model, PersistedModel } from "../models";

export interface Storage {
    save(model: Model): Promise<PersistedModel>;
    query(modelName: string): Promise<PersistedModel | PersistedModel[]>;
}