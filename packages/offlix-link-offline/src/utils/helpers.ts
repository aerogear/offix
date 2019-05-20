import { getMainDefinition, hasDirectives } from "apollo-utilities";
import { Operation, DocumentNode } from "apollo-link";
import { localDirectives } from "../config/Constants";
import { OperationDefinitionNode, FieldNode } from "graphql";
import { resultKeyNameFromField } from "apollo-utilities";
import { Query, QueryWithVariables } from "../cache/CacheUpdates";
import { OperationVariables } from "apollo-client";

export const isSubscription = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "subscription";
};

export const isMutation = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "mutation";
};

export const isOnlineOnly = (op: Operation) => {
  return hasDirectives([localDirectives.ONLINE_ONLY], op.query);
};

export const isNetworkError = (error: any) => {
  return !error.result;
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
export const deconstructQuery = (updateQuery: Query): QueryWithVariables => {
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

const isQueryWithVariables = (doc: Query): doc is QueryWithVariables => {
  if ((doc as QueryWithVariables).variables) {
    return true;
  } else {
    return false;
  }
};
