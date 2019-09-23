import { QueueEntryOperation } from "offix-offline";
import { MutationOptions } from "apollo-client";

export const ApolloOperationSerializer = {
  serializeForStorage: ({ op, qid }: QueueEntryOperation<MutationOptions>) => {
    return {
      mutation: op.mutation,
      variables: op.variables,
      optimisticResponse: op.optimisticResponse,
      context: op.context
    };
  }
};
