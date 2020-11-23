import endent from "endent";

const getModelProperties = (schema: any) => {
    const fieldMap = schema.properties;
    const keys = Object.keys(fieldMap);

    return keys
      .map(fieldName => {
        const s = fieldMap[fieldName];
        const name = s.isRequired ? fieldName : `${fieldName}?`;
        return `${name}: ${s.type}`;
      })
      .join(";\n");
};

export const createModelType = (schema: any) => {
    const { name: modelName, primaryKey } = schema;

    return endent`
      export interface ${modelName} {
        ${getModelProperties(schema)}
      }

      export type ${modelName}Create = ${primaryKey ? `Omit<${modelName}, "${primaryKey}">` : modelName};
      export type ${modelName}Change =  ${primaryKey ? `Pick<${modelName}, "${primaryKey}"> & ` : ""}Partial<${modelName}Create>;

    `;
};
