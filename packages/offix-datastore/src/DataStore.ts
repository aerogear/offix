import { buildSchema } from "graphql";
import { readFileSync } from "fs";
import { createDefaultStorage, Storage } from "./storage";
import { extractModelsFromSchema } from "./models";

let storage: Storage;

export function configure(schemaLocation: string, schemaVersion: number = 1) {
    const schemaText = readFileSync(schemaLocation, 'utf8');
    const schema = buildSchema(schemaText);
    const models = extractModelsFromSchema(schema);
    storage = createDefaultStorage(models, schemaVersion);
}
