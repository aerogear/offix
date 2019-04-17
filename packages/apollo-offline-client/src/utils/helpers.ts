import { getMainDefinition, hasDirectives } from "apollo-utilities";
import { Operation, DocumentNode } from "apollo-link";
import { localDirectives } from "../config/Constants";
import { OperationDefinitionNode } from "graphql";

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
