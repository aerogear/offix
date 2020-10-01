import { ModelDefinition, getPrimaryKey, parseRelationshipAnnotation } from "@graphback/core";
import { GraphQLOutputType, isNonNullType, getNullableType, GraphQLField } from "graphql";
import { convertToTsType } from "../utils";

const getField = (fieldName: string, field: GraphQLField<any, any>) => {
  let type = field.type;

  // const relationship = parseRelationshipAnnotation(field.description as string);
  // if (relationship) {
  //   if(relationship.kind === "oneToMany"){

  //   }
  //   `${fieldName}: ${convertToTsType(type)}`;
  // }

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
    .map(fieldName => (getField(fieldName, fieldMap[fieldName])))
    .join(";\n    ");
};

// TODO use JSON schema here that already has relationships.
// No need to process same things twice and have code duplication
export const createModelType = (model: ModelDefinition) => {
  const modelName = model.graphqlType.name;
  const primaryKey = getPrimaryKey(model.graphqlType).name;

  return `export interface ${modelName} {
    ${getModelProperties(model)}
    _version: number;
}

export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "${primaryKey}"> & ` : ""}Partial<${modelName}Create>;
`;
};
