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
    .map(fieldName => {
      if (fieldName === "_version") {
        // We want to add our own version
        return "";
      }
      return getField(fieldName, fieldMap[fieldName].type);
    })
    .join(";\n    ") + "   _version: number;\n    ";
};

export const createModelType = (model: ModelDefinition) => {
  const modelName = model.graphqlType.name;
  const primaryKey = getPrimaryKey(model.graphqlType).name;

  return `export interface ${modelName} {
    ${getModelProperties(model)}
}

export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "${primaryKey}"> & ` : ""}Partial<${modelName}Create>;
`;
};
