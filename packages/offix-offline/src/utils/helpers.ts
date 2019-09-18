import { getMainDefinition} from "apollo-utilities";
import { Operation } from "apollo-link";

export const isSubscription = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "subscription";
};

export const isMutation = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "mutation";
};

export const isNetworkError = (error: any) => {
  return !error.result;
};

export const isMarkedOffline = (operation: Operation) => {
  return !!operation.getContext().isOffline;
}
