import { getMainDefinition, hasDirectives } from "apollo-utilities";
import { Operation } from "apollo-link";
import { localDirectives } from "../config/Constants";

/**
 * Check if operation was done when offline
 */
export const markOffline = (operation: Operation) => {
  operation.extensions.persistedOffline = true;
};

/**
 * Checks if operation was scheduled to saved to offline queue.
 * This operations have special handling.
 * They are never forwarded when sent back again to client.
 */
export const isMarkedOffline = (operation: Operation) => {
  return !!(operation.extensions.persistedOffline);
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
