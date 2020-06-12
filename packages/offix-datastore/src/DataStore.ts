import { buildSchema } from "graphql";
import { readFileSync } from "fs";
import { createDefaultStorage, Storage } from "./storage";
import { extractModelsFromSchema, Model, PersistedModel } from "./models";
import { createPredicate } from "./predicates";

let storage: Storage;

export function configure(schemaLocation: string, schemaVersion: number = 1) {
    const schemaText = readFileSync(schemaLocation, "utf8");
    const schema = buildSchema(schemaText);
    const models = extractModelsFromSchema(schema);
    storage = createDefaultStorage(models, schemaVersion);
}

export function save(model: Model): Promise<PersistedModel> {
    return storage.save(model);
}

export function query(model: Model, predicateFunction?: Function) {
    if (!predicateFunction) {return storage.query(model.__typename);}

    const modelPredicate = createPredicate(model);
    const predicate = predicateFunction(modelPredicate);
    return storage.query(model.__typename, predicate);
}

export function update(model: PersistedModel) {
    return storage.update(model);
}

// TODO delete all?
export function remove(model: PersistedModel, predicateFunction?: Function) {
    if (!predicateFunction) {return storage.remove(model);}

    const modelPredicate = createPredicate(model);
    const predicate = predicateFunction(modelPredicate);
    return storage.remove(model, predicate);
}
