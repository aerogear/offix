import { ModelDefinition } from "@graphback/core";

export const createJsonSchema = (model: ModelDefinition) => {
    return {
        name: model.graphqlType.name,
        properties: getModelProperties(model)
    }
}

const getModelProperties = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();
    return Object.keys(fieldMap)
        .map(fieldName => ({ [fieldName]: { test: "test" } }))
        .reduce((prev, current) => ({ ...prev, ...current }), {});
}
