import { ModelDefinition, getPrimaryKey } from "@graphback/core";
import { GraphQLOutputType, isNonNullType, getNullableType } from "graphql";
import { convertToTsType } from "../utils";

const getField = (fieldName: string, type: GraphQLOutputType) => {
    if (isNonNullType(type)) {
        type = getNullableType(type);
    } else {
        fieldName = `${fieldName}?`;
    }

    return `${fieldName}: ${convertToTsType(type)}`;
};

const getModelProperties = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();

    return Object.keys(fieldMap)
        .map(fieldName => (getField(fieldName, fieldMap[fieldName].type)))
        .join(";\n    ");
};

export const createModelType = (model: ModelDefinition) => {
    const modelName = model.graphqlType.name;
    const primaryKey = getPrimaryKey(model.graphqlType).name;

    return `export interface ${modelName} {
    ${getModelProperties(model)}
    _version: number;
    _deleted: boolean;
}

export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "${primaryKey}"> & ` : ""}Partial<${modelName}Create>;
`;
};
