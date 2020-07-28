import { DataSyncJsonSchema } from "offix-datastore";
import jsonSchema from "./schema.json";

type Schema<T = any> = {
    [P in keyof T]: DataSyncJsonSchema<any>
};

export const schema = jsonSchema as Schema;
