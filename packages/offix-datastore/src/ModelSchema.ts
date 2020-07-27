import invariant from "tiny-invariant";
import { JSONSchema7 } from "json-schema";

export interface DataSyncProperties extends JSONSchema7 {
  index?: boolean;
  primary?: boolean;
  default?: any;
  encrypted?: boolean;
  // TODO investigate scalars
}

export declare class DataSyncJsonSchema<T> {
  name: string;
  namespace?: string;
  version: number;
  indexes?: string[];
  encrypted?: string[];
  primaryKey?: string;
  type: "object";
  properties?: {
    [key: string]: DataSyncProperties;
  };
};

export class ModelSchema<T = any>{
  private name: string;
  private namespace: string;
  private primaryKey: string;
  private fields: string[];
  private encrypted: string[];
  private version: number;
  private indexes: string[] = [];

  constructor(schema: DataSyncJsonSchema<T>) {
    invariant(schema, "Schema cannot be undefined");
    this.version = schema.version || 0;
    this.name = schema.name;
    this.namespace = schema.namespace || "user";
    this.fields = extractFields(schema);
    this.primaryKey = extractPrimary(schema);
    this.indexes = extractIndexes(schema);
    this.encrypted = extractEncryptedFields(schema);
  }

  public fill(): void {
    // TODO fill object with default values
  }

  public validate() {
    // TODO validate the schema
  }

  public getName() {
    return this.name;
  }

  public getNamespace() {
    return this.namespace;
  }

  public getIndexes(): string[] {
    return this.indexes;
  }

  public getPrimaryKey(): string {
    return this.primaryKey;
  }

  public getFields(): string[] {
    return this.fields;
  }

  public getVersion(): number {
    return this.version;
  }

  public getEncryptedFields(): string[] {
    return this.encrypted;
  }

};

function extractFields<T = any>(schema: DataSyncJsonSchema<T>): string[] {
  invariant(schema.properties, "Properties cannot be undefined");
  return Object.keys(schema.properties);
}

function extractIndexes<T = any>(schema: DataSyncJsonSchema<T>) {
  const { properties, indexes } = schema;
  if (!indexes) {
    invariant(properties, "Schema is undefined");
    return Object.keys(properties)
      .filter((key) => {
        if (properties[key].index) {
          return key;
        };
      });
  }
  return indexes;
}

function extractPrimary<T = any>(schema: DataSyncJsonSchema<T>): string {
  const { properties, primaryKey } = schema;
  if (!primaryKey) {
    invariant(properties, "Schema is undefined");
    const obj = Object.keys(properties)
      .find((key) => properties[key].primary);
    return obj || "_id";
  }
  return primaryKey;
}

function extractEncryptedFields<T = any>(schema: DataSyncJsonSchema<T>): string[] {
  const { properties, encrypted } = schema;
  if (!encrypted) {
    invariant(properties, "Schema is undefined");
    return Object.keys(properties)
      .filter((key) => properties[key].encrypted);
  }
  return encrypted;
}

export function createModelSchema<T = any>(schema: DataSyncJsonSchema<T>): ModelSchema<T> {
  const modelSchema =  new ModelSchema<T>(schema);
  // TODO validation could potentially be run
  // in the constructor
  modelSchema.validate();
  return modelSchema;
}
