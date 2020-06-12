import { Model, PersistedModel } from "../models";
import { PredicateFunction } from "../predicates";

export interface Storage {
    save(model: Model): Promise<PersistedModel>;
    query(modelName: string, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]>;
    update(model: PersistedModel): Promise<PersistedModel>;
    remove(model: PersistedModel, predicate?: PredicateFunction): Promise<PersistedModel | PersistedModel[]>;
}
