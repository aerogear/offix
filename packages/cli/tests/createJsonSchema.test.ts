import { GraphbackCoreMetadata, ModelDefinition } from "@graphback/core";
import { buildSchema } from "graphql";
import { createJsonSchema } from "../src/generate-documents/createJsonSchema";

const noteFragment = (annotation: string, array: boolean = true) => (`
  """
  @model
  @datasync
  """
  type Note {
    _id: GraphbackObjectID!
    title: String!
    description: String!
    ${annotation}
    ${array ? "comments: [Comment]!" : "comment: Comment!"}
  }
`);

const commentFragment = (annotation: string) => (`
  """
  @model
  @datasync
  """
  type Comment {
    _id: GraphbackObjectID!
    title: String!
    description: String!
    ${annotation}
    noteComment: Note!
  }
`);

test("createJsonSchema (@oneToOne - default)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToOne()
      """
    `, false)}
    ${commentFragment("")}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.commentId).toBeDefined();
  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteId).not.toBeDefined();
});

test("createJsonSchema (@oneToOne - key specified)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToOne(key: 'commentId')
      """
    `, false)}
    ${commentFragment("")}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.commentId).toBeDefined();
  expect(noteJsonSchema).toMatchSnapshot();

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteId).not.toBeDefined();
  expect(commentJsonSchema).toMatchSnapshot();
});

test("createJsonSchema (@oneToMany - default key)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToMany(field: 'noteComment')
      """
    `)}
    ${commentFragment("")}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.comment).not.toBeDefined();
  expect(noteJsonSchema).toMatchSnapshot();

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteComment).not.toBeDefined();
  expect(commentJsonSchema.properties.noteCommentId).toBeDefined();
  expect(commentJsonSchema).toMatchSnapshot();
});

test("createJsonSchema (@oneToMany - key specified)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToMany(field: 'noteComment', key: 'noteId')
      """
    `)}
    ${commentFragment("")}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.comment).not.toBeDefined();
  expect(noteJsonSchema).toMatchSnapshot();

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteId).toBeDefined();
  expect(commentJsonSchema).toMatchSnapshot();
});

test("createJsonSchema (@oneToMany & @manyToOne - default key)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToMany(field: 'noteComment')
      """
    `)}
    ${commentFragment(`
      """
      @manyToOne(field: 'comments')
      """
    `)}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.comment).not.toBeDefined();
  expect(noteJsonSchema).toMatchSnapshot();

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteComment).not.toBeDefined();
  expect(commentJsonSchema.properties.noteCommentId).toBeDefined();
  expect(commentJsonSchema).toMatchSnapshot();
});

test("createJsonSchema (@oneToMany & @manyToOne - key specified)", () => {
  const modelSDL = `
    scalar GraphbackObjectID
    ${noteFragment(`
      """
      @oneToMany(field: 'noteComment', key: 'noteId')
      """
    `)}
    ${commentFragment(`
      """
      @manyToOne(field: 'comments', key: 'noteId')
      """
    `)}
  `;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const note = models.find((m: ModelDefinition) => m.graphqlType.name === "Note");
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const noteJsonSchema: any = createJsonSchema(note as ModelDefinition);
  expect(noteJsonSchema.properties.comment).not.toBeDefined();
  expect(noteJsonSchema).toMatchSnapshot();

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteId).toBeDefined();
  expect(commentJsonSchema).toMatchSnapshot();
});
