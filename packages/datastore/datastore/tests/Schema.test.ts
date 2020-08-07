import { ModelJsonSchema, ModelSchema, Fields, createModelSchema } from "../src/ModelSchema";

const basicSchema = {
  name: "Hello",
  type: "object",
  properties: {}
} as ModelJsonSchema<any>;

const namespaceSchema = {
  ...basicSchema,
  namespace: "app"
} as ModelJsonSchema<any>;

const properties = {
  id: {
    type: "string",
    index: true,
    primary: true
  },
  name: {
    type: "string",
    index: true
  },
  email: {
    type: "string",
    index: true
  },
  password: {
    type: "string",
    encrypted: true
  },
  dob: {
    type: "string"
  }
} as unknown as Fields<any>;

const indexes = ["id", "name", "email"];
const notIndexes = ["password", "dob"];

const encrypted = ["password"];
const notEncrypted = ["id", "name", "email", "dob"];

test("it should throw an error when json schema `properties` are not provided ", () => {
  const schema = { name: "Hello", type: "object" } as ModelJsonSchema<any>;
  expect(() => new ModelSchema(schema)).toThrowError();
});

test("it should return the same schema as the createModelSchema method", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const m1 = new ModelSchema(schema);
  const m2 = createModelSchema(schema);
  expect(m1).toEqual(m2);
});

test("it should return the correct name", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getName()).toBe(schema.name);
});

test("it should return the correct version (default)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getVersion()).toBe(0);
});

test("it should return the version name (specified)", () => {
  const version = 2;
  const schema = { ...basicSchema, properties, version } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getVersion()).toBe(version);
});

test("it should return the correct fields", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getFields()).toBe(schema.properties);
});

test("it should return the correct namespace (default)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getNamespace()).toBe("user");
});

test("it should return the correct namespace (specified)", () => {
  const schema = { ...namespaceSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getNamespace()).toBe(schema.namespace);
});

test("it should return the correct storename (default)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getStoreName()).toBe(`user_${schema.name}`);
});

test("it should return the correct storename (specified)", () => {
  const schema = { ...namespaceSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getStoreName()).toBe(`${schema.namespace}_${schema.name}`);
});

test("it should return the correct primary key (field level)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getPrimaryKey()).toBe("id");
});

test("it should return the correct primary key (specified)", () => {
  const schema = { ...basicSchema, properties, primaryKey: "id" } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getPrimaryKey()).toBe("id");
});

test("it should throw error when no primary key is provided", () => {
  const schema = { ...namespaceSchema, properties: {} } as ModelJsonSchema<any>;
  expect(() => new ModelSchema(schema)).toThrowError();
});

test("it should throw error when specified primary key is not in `properties`", () => {
  const schema = { ...namespaceSchema, primaryKey: "id" } as ModelJsonSchema<any>;
  expect(() => new ModelSchema(schema)).toThrowError();
});

test("it should return correct indexes (field level)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getIndexes()).toEqual(indexes);
  expect(model.getIndexes()).not.toEqual(notIndexes);
});

test("it should return correct indexes (specified)", () => {
  const schema = { ...basicSchema, properties, indexes } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getIndexes()).toEqual(indexes);
  expect(model.getIndexes()).not.toEqual(notIndexes);
});

test("it should throw an error if specified index is not in `properties`", () => {
  const schema = { ...basicSchema, indexes } as ModelJsonSchema<any>;
  expect(() => new ModelSchema(schema)).toThrowError();
});

test("it should return correct encrypted fields (field level)", () => {
  const schema = { ...basicSchema, properties } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getEncryptedFields()).toEqual(encrypted);
  expect(model.getEncryptedFields()).not.toEqual(notEncrypted);
});

test("it should return correct indexes (specified)", () => {
  const schema = { ...basicSchema, properties, encrypted } as ModelJsonSchema<any>;
  const model = new ModelSchema(schema);
  expect(model.getEncryptedFields()).toEqual(encrypted);
  expect(model.getEncryptedFields()).not.toEqual(notEncrypted);
});

test("it should throw an error if specified index is not in `properties`", () => {
  const schema = { ...basicSchema, encrypted } as ModelJsonSchema<any>;
  expect(() => new ModelSchema(schema)).toThrowError();
});
