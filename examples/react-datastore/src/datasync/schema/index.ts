import { ModelJsonSchema } from "offix-datastore";
import jsonSchema from "./schema.json";

type Schema<T = any> = {
    [P in keyof T]: ModelJsonSchema<any>
};

export const schema = jsonSchema as Schema;
