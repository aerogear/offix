import { getMainDefinition } from "apollo-utilities";
import { Operation } from "apollo-link";

export const isSubscription = (op: Operation) => {
  const query = op.query;
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "subscription";
};
