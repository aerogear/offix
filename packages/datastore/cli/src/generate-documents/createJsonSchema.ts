import { ModelDefinition, getPrimaryKey } from "@graphback/core";
import {
  isNonNullType,
  GraphQLOutputType,
  getNullableType
} from "graphql";
import { convertToTsType } from "../utils";

const getFieldParameters = (fieldName: string, type: GraphQLOutputType): any => {
  const options: any = {};

  options.key = fieldName;

  if (isNonNullType(type)) {
    type = getNullableType(type);
    options.isRequired = true;
  }

  return { type: convertToTsType(type), ...options };
};

const getModelProperties = (model: ModelDefinition, primaryKey: string) => {
  const fieldMap = model.graphqlType.getFields();
  const keys = Object.keys(fieldMap);

  const relationships = model.relationships
    .filter(r => r.kind !== "oneToMany")
    .map(r => {
      const fieldOptions = getFieldParameters(
        r.relationForeignKey!,
        r.relationType
      );
      fieldOptions.relationship = r.relationType;
      return { [r.relationForeignKey!]: fieldOptions };
    });
  const relNames = model.relationships.map(r => r.ownerField.name);

  const generatedProperties = keys
    .filter(fieldName => !relNames.includes(fieldName))
    .map(fieldName => {
      const fieldOptions = getFieldParameters(
        fieldName,
        fieldMap[fieldName].type
       );
      if (fieldName === primaryKey) {
        fieldOptions.primary = true;
      }
      return { [fieldName]: fieldOptions };
    })
    .concat(relationships)
    .reduce((prev, current) => ({ ...prev, ...current }), {});

  generatedProperties._version = {
    type: "string",
    key: "_version",
    isRequired: true
  };
  return generatedProperties;
};

// TODO refactor use GraphQL type instead of model
// definition
export const createJsonSchema = (model: ModelDefinition) => {
  const primaryKey = getPrimaryKey(model.graphqlType).name;

  return {
    name: model.graphqlType.name,
    version: 1,
    type: "object",
    primaryKey: primaryKey,
    properties: getModelProperties(model, primaryKey)
  };
};
