import { ModelDefinition } from "@graphback/core";
import { GraphQLOutputType, isNonNullType, getNullableType, isCompositeType } from "graphql";
import { convertToTsType } from "./utils";

const isPrimaryKey = (fieldName: string, type: GraphQLOutputType) => {
    if (isNonNullType(type)) {
        type = getNullableType(type);
    }

    return (type.toString() === "ID");
}

const getPrimaryKey = (model: ModelDefinition) => {
    const fieldMap = model.graphqlType.getFields();

    return Object.keys(fieldMap)
        .find((fieldName) => (isPrimaryKey(fieldName, fieldMap[fieldName].type)))
}

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
    const primaryKey = getPrimaryKey(model);

    return `export interface ${modelName} {
    ${getModelProperties(model)}
}

export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "id"> && ` : ""}Partial<${modelName}Create>;
`;
}
