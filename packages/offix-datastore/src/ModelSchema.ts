import invariant from "tiny-invariant";
import { JSONSchema7 } from "json-schema";

export interface DSProperties extends JSONSchema7 {
  index?: boolean;
  primary?: boolean;
  default?: any;
  encrypted?: boolean;
  key?: string;
}

export declare class DSJsonSchema<T> {
  name: string;
  namespace?: string;
  version: number;
  indices?: string[];
  encrypted?: string[];
  primaryKey?: string;
  type: "object";
  properties?: {
    [key: string]: DSProperties;
  };
};

export class ModelSchema<T = any>{
  private schema: DSJsonSchema<T>;
  private primaryKey: string;
  private fields: string[];
  private encrypted: string[];
  private version: number;
  private indices: string[] = [];

  constructor(schema: DSJsonSchema<T>) {
    invariant(schema, "Schema cannot be undefined");
    this.schema = schema;
    this.version = schema.version || 0;
    this.fields = extractFields(schema);
    this.primaryKey = extractPrimary(schema);
    this.indices = extractIndices(schema);
    this.encrypted = extractEncryptedFields(schema);
  }

  public getIndices(): string[] {
    return this.indices;
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

function extractFields<T = any>(schema: DSJsonSchema<T>): string[] {
  invariant(schema.properties, "Properties cannot be undefined");
  return Object.keys(schema.properties);
}

function extractIndices<T = any>(schema: DSJsonSchema<T>) {
  const { properties, indices } = schema;
  if (!indices) {
    invariant(properties, "Schema is undefined");
    return Object.keys(properties)
      .filter((key) => {
        if (properties[key].index) {
          return key;
        };
      });
  }
  return indices;
}

function extractPrimary<T = any>(schema: DSJsonSchema<T>): string {
  const { properties, primaryKey } = schema;
  if (!primaryKey) {
    invariant(properties, "Schema is undefined");
    const obj = Object.keys(properties)
      .find((key) => properties[key].primary);
    return obj || "_id";
  }
  return primaryKey;
}

function extractEncryptedFields<T = any>(schema: DSJsonSchema<T>): string[] {
  const { properties, encrypted } = schema;
  if (!encrypted) {
    invariant(properties, "Schema is undefined");
    return Object.keys(properties)
      .filter((key) => properties[key].encrypted);
  }
  return encrypted;
}
