// import { ModelDefinition, getPrimaryKey } from "@graphback/core";
import { GraphQLOutputType, isNonNullType, getNullableType } from "graphql";
import { convertToTsType } from "../utils";

const getField = (fieldName: string, type: GraphQLOutputType) => {
    if (isNonNullType(type)) {
        type = getNullableType(type);
    } else {
        fieldName = `${fieldName}?`;
    }

    // return `${fieldName}: ${convertToTsType(type)}`;
    return `${fieldName}: ${type}`;
};

const getModelProperties = (schema: any) => {
    const fieldMap = schema.properties;
    const keys = Object.keys(fieldMap);
    // const relNames = model.relationships.map(r => r.ownerField.name);

    // // Create a set to remove duplicates
    // const relationships = new Set(model.relationships
    //   // filter out oneToMany fields
    //   .filter(r => r.kind !== "oneToMany")
    //   // get fields for relationships
    //   .map(r => (getField(r.relationForeignKey!, r.relationType)))
    //  );

    return keys
    //   // filter out auto generated relationship fields
    //   .filter(fieldName => !relNames.includes(fieldName))
      .map(fieldName => {
        const s = fieldMap[fieldName];
        const name = s.isRequired ? fieldName : `${fieldName}?`;
        return `${name}: ${s.type}`;
      })
    //   // add fields from relationships (with foreign key)
    //   .concat(Array.from(relationships))
      .join(";\n    ");
};

export const createModelType = (schema: any) => {
    const { name: modelName, primaryKey } = schema;
 
    return `
      export interface ${modelName} {
          ${getModelProperties(schema)}
      }

      export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
      export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "${primaryKey}"> & ` : ""}Partial<${modelName}Create>;
  `;
};
