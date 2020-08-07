import invariant from "tiny-invariant";
import { JSONSchema7 } from "json-schema";
import { Filter } from "./filters";

/**
 * Defines the properties expected in the Fields object for a model
 */
export type Fields<T> = Record<keyof T, ModelSchemaProperties>;

export interface ModelSchemaProperties extends JSONSchema7 {
  index?: boolean;
  primary?: boolean;
  default?: any;
  encrypted?: boolean;
  /**
   * GraphQL field name.
   * It is used for graphql query generation
   */
  key?: string;
}

export declare class ModelJsonSchema<T> {
  name: string;
  namespace?: string;
  version?: number;
  indexes?: string[];
  encrypted?: string[];
  primaryKey?: string;
  type: "object";
  properties?: Fields<T>;
};

export class ModelSchema<T = any>{
  private name: string;
  private namespace: string;
  private primaryKey: string;
  private fields: Fields<T>;
  private encrypted: string[];
  private version: number;
  private indexes: string[] = [];

  constructor(schema: ModelJsonSchema<T>) {
    invariant(schema, "Schema cannot be undefined");
    this.version = schema.version || 0;
    this.name = schema.name;
    this.namespace = schema.namespace || "user";
    this.fields = extractFields(schema);
    this.primaryKey = extractPrimary(this.fields, schema.primaryKey);
    this.indexes = extractIndexes(this.fields, schema.indexes);
    this.encrypted = extractEncryptedFields(this.fields, schema.encrypted);
  }

  public fill(): void {
    // TODO fill object with default values
  }

  public getName(): string {
    return this.name;
  }

  public getNamespace(): string {
    return this.namespace;
  }

  public getStoreName(): string {
    return `${this.namespace}_${this.name}`;
  }

  public getIndexes(): string[] {
    return this.indexes;
  }

  public getPrimaryKey(): string {
    return this.primaryKey;
  }

  public getPrimaryKeyFilter(data: any): Filter {
    if (data[this.primaryKey]) {
      return { [this.primaryKey]: data[this.primaryKey] };
    } else {
      throw new Error("Primary key not included in data");
    }

  }

  public getFields(): Fields<T> {
    return this.fields;
  }

  public getVersion(): number {
    return this.version;
  }

  public getEncryptedFields(): string[] {
    return this.encrypted;
  }
};

function extractFields<T = any>(schema: ModelJsonSchema<T>): Fields<T> {
  invariant(schema.properties, "Datasync: Properties cannot be undefined");
  return schema.properties;
}

function extractIndexes<T = any>(fields: Fields<T>, indexes?: string[]): string[] {
  if (!indexes) {
    return Object.keys(fields)
      .filter((key: string) => {
        const field = fields[key as keyof T];
        if (field.index) {
          return key;
        };
      });
  }
  indexes.forEach((index) => {
    invariant(index in fields,
      `Datasync: ${index} in the indexes array is missing
      from the properties field in the model schema`
    );
  });
  return indexes;
}

function extractPrimary<T = any>(fields: Fields<T>, primaryKey?: string): string {
  if (!primaryKey) {
    const obj = Object.keys(fields)
      .find((key: string) => fields[key as keyof T].primary);
    invariant(obj, "Datasync: no primary key provided. Please specify a primary key");
    return obj;
  }
  invariant(primaryKey in fields,
    `Datasync: ${primaryKey} provided does not exist in
    the properties of the modelschema`
  );
  return primaryKey;
}

function extractEncryptedFields<T = any>(fields: Fields<T>, encrypted?: string[]): string[] {
  if (!encrypted) {
    return Object.keys(fields)
      .filter((key) => fields[key as keyof T].encrypted);
  }
  encrypted.forEach((enc) => {
    invariant(enc in fields,
      `Datasync: ${enc} in the encrypted fields array is missing
      from the properties field in the model schema`
    );
  });
  return encrypted;
}

export function createModelSchema<T = any>(schema: ModelJsonSchema<T>): ModelSchema<T> {
  const modelSchema = new ModelSchema<T>(schema);
  return modelSchema;
}
