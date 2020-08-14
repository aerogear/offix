import { ModelSchema } from "../../ModelSchema";

export const getPrimaryKey = (schemas: ModelSchema[], storeName: string) => {
    const schema = schemas.find((s) => (s.getStoreName() === storeName));
    if (!schema) { throw new Error("Store does not exist"); }
    return schema.getPrimaryKey();
};
