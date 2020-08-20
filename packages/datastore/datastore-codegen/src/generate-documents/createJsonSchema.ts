import { ModelDefinition, getPrimaryKey } from "@graphback/core";
import {
    isNonNullType,
    GraphQLOutputType,
    getNullableType
} from "graphql";
import { convertToTsType } from "../utils";


const getFieldParameters = (fieldName: string, type: GraphQLOutputType): any => {
    const options: any = {};

    // TODO handle relationships

    options.key = fieldName;

    if (isNonNullType(type)) {
        type = getNullableType(type);
        options.isRequired = true;
    }

    return { type: convertToTsType(type), ...options };
};

const getModelProperties = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();
    const primaryKey = getPrimaryKey(model.graphqlType).name;

    return Object.keys(fieldMap)
        .map(fieldName => {
            const fieldOptions = getFieldParameters(fieldName, fieldMap[fieldName].type);
            if (fieldName === primaryKey) {
                fieldOptions.primary = true;
            }
            return fieldOptions;
        })
        .reduce((prev, current) => ({ ...prev, ...current }), {});
};

export const createJsonSchema = (model: ModelDefinition) => {
    return {
        name: model.graphqlType.name,
        version: 1,
        type: "object",
        primaryKey: "id",
        properties: getModelProperties(model)
    };
};
