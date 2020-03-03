import { DocumentNode } from "apollo-link";
import { OperationVariables } from "apollo-client";
import { resultKeyNameFromField } from "apollo-utilities";
import { OperationDefinitionNode, FieldNode } from "graphql";
import { CacheUpdatesQuery, QueryWithVariables } from "../api/CacheUpdates";
import { CLIENT_ID_PREFIX } from "./constants";

// Returns true if ID was generated on client
export const isClientGeneratedId = (id: string): boolean => {
  return typeof id === 'string' && id.startsWith(CLIENT_ID_PREFIX);
};

// Helper method for ID generation ()
export const generateClientId = (length = 8) => {
  let result = CLIENT_ID_PREFIX;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const getMutationName = (mutation: DocumentNode) => {
  const definition = mutation.definitions.find(def => def.kind === "OperationDefinition");
  const operationDefinition = definition && definition as OperationDefinitionNode;
  return operationDefinition && operationDefinition.name && operationDefinition.name.value;
};

export const getOperationFieldName = (operation: DocumentNode): string => resultKeyNameFromField(
    (operation.definitions[0] as OperationDefinitionNode).selectionSet.selections[0] as FieldNode
);

// this function takes a Query and returns its constituent parts, if available.
export const deconstructQuery = (updateQuery: CacheUpdatesQuery): QueryWithVariables => {
  let query: DocumentNode;
  let variables: OperationVariables | undefined;
  if (isQueryWithVariables(updateQuery)) {
    query = updateQuery.query;
    variables = updateQuery.variables;
  } else {
    query = updateQuery;
  }
  return { query, variables };
};

const isQueryWithVariables = (doc: CacheUpdatesQuery): doc is QueryWithVariables => {
  if ((doc as QueryWithVariables).variables) {
    return true;
  } else {
    return false;
  }
};
