import { ModelDefinition } from "@graphback/core";
import { GraphQLOutputType, isNonNullType, getNullableType } from "graphql";
import { convertToTsType } from "./utils";

const getField = (fieldName: string, type: GraphQLOutputType) => {
    if (isNonNullType(type)) {
        type = getNullableType(type);
    } else {
        fieldName = `${fieldName}?`;
    }

    return `${fieldName}: ${convertToTsType(type)}`;
}

const getModelProperties = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();

    return Object.keys(fieldMap)
        .map(fieldName => (getField(fieldName, fieldMap[fieldName].type)))
        .join(";\n    ");
};

export const createModelType = (model: ModelDefinition) => {
    const modelName = model.graphqlType.name;
    return `export interface ${modelName} {
    ${getModelProperties(model)}
}

export type ${modelName}Create = Omit<${modelName}, "id">;
export type ${modelName}Change = Pick<${modelName}, "id"> && Partial<${modelName}Create>;
`;
}
