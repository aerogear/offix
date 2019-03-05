import { getMainDefinition, hasDirectives } from "apollo-utilities";
import { Operation } from "apollo-link";
import { localDirectives } from "../config/Constants";

export const markOffline = (operation: Operation) => {
  if (typeof operation.getContext === "function") {
    operation.setContext({ persitedOffline: true });
  }
};

export const markedOffline = (operation: Operation) => {
  if (typeof operation.getContext === "function") {
    return !!(operation.getContext().persitedOffline);
  }
  return false;
};

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
