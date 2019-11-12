import { PersistedData } from "offix-scheduler";
import { ApolloQueueEntryOperation } from "./ApolloOfflineClient";

/**
 * Apollo Specific implementation of the Serializer interface.
 * Knows sanitize a MutationOptions object for storage in indexedDB
 */
export const ApolloOperationSerializer = {
  serializeForStorage: ({ op, qid }: ApolloQueueEntryOperation) => {
    return {
      mutation: op.mutation,
      variables: op.variables,
      optimisticResponse: op.optimisticResponse,
      context: op.context
    };
  },
  deserializeFromStorage: (item: PersistedData) => {
    if (typeof item === "string") {
      item = JSON.parse(item);
    }
    return item;
  }
};
