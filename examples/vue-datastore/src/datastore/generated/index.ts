import { GeneratedModelSchema } from "offix-datastore";
import jsonSchema from "./schema.json";

export const schema = jsonSchema as GeneratedModelSchema;
export * from "./types";