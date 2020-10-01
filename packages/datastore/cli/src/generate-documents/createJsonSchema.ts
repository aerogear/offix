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
  // TODO filter out  fields that are relationship fields

  // const relationship = parseRelationshipAnnotation(field.description as string);
  // if (relationship) {
  //   if(relationship.kind === "oneToMany"){

  //   }
  // }



  const generatedProperties = Object.keys(fieldMap)
    .map(fieldName => {
      const fieldOptions = getFieldParameters(fieldName, fieldMap[fieldName].type);
      if (fieldName === primaryKey) {
        fieldOptions.primary = true;
      }
      return { [fieldName]: fieldOptions };
    })
    .reduce((prev, current) => ({ ...prev, ...current }), {});

  generatedProperties._version = {
    type: "string",
    key: "_version",
    isRequired: true
  };
  return generatedProperties;
};

export const createJsonSchema = (model: ModelDefinition) => {
  const primaryKey = getPrimaryKey(model.graphqlType).name;

  const modelProperties = getModelProperties(model, primaryKey);
  // TODO add relationships properties based on the annotations:

  return {
    name: model.graphqlType.name,
    version: 1,
    type: "object",
    primaryKey: primaryKey,
    properties: getModelProperties(model, primaryKey)
  };
};
