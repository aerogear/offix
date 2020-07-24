import { ModelDefinition } from "@graphback/core";
import {
    isNonNullType,
    GraphQLOutputType,
    getNullableType,
} from "graphql";
import { convertToTsType } from "../utils";


const getFieldParameters = (type: GraphQLOutputType): any => {
    let options: any = {};

    // TODO handle relationships

    if (isNonNullType(type)) {
        type = getNullableType(type);
        options = { isRequired: true }
    }
    return { type: convertToTsType(type), ...options };
}

const getModelProperties = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();

    return Object.keys(fieldMap)
        .map(fieldName => ({
            [fieldName]: getFieldParameters(fieldMap[fieldName].type)
        }))
        .reduce((prev, current) => ({ ...prev, ...current }), {});
}

export const createJsonSchema = (model: ModelDefinition) => {
    return {
        name: model.graphqlType.name,
        properties: getModelProperties(model)
    }
}
