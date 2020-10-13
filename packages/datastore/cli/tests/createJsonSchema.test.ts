import { GraphbackCoreMetadata, ModelDefinition } from "@graphback/core";
import { buildSchema } from "graphql";
import { createJsonSchema } from "../src/generate-documents/createJsonSchema";

test("createJsonSchema", () => {
  const modelSDL =
`
scalar GraphbackObjectID

"""
@model
@datasync
"""
type Note {
  _id: GraphbackObjectID!
  title: String!
  description: String!
  """
  @oneToMany(field: 'noteComment', key: 'noteId')
  """
  comments: [Comment]!
}

"""
@model
@datasync
"""
type Comment {
  _id: GraphbackObjectID!
  title: String!
  description: String!
  """
  @manyToOne(field: 'comments', key: 'noteId')
  """
  noteComment: Note!
}
`;

  const metadata = new GraphbackCoreMetadata({ crudMethods: {} }, buildSchema(modelSDL));
  const models = metadata.getModelDefinitions();
  const comment = models.find((m: ModelDefinition) => m.graphqlType.name === "Comment");

  const commentJsonSchema: any = createJsonSchema(comment as ModelDefinition);
  expect(commentJsonSchema.properties.noteId).toBeDefined();
});