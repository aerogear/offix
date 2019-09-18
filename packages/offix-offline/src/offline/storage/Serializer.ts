import { QueueEntryOperation } from "../OfflineQueue";

export interface Serializer {
  serializeForStorage(entry: QueueEntryOperation): any;
}

export const ApolloOperationSerializer = {
  serializeForStorage: ({ op, qid }: QueueEntryOperation) => {
    return {
      mutation: op.mutation,
      variables: op.variables,
      optimisticResponse: op.optimisticResponse,
      context: op.context,
      returnType: op.returnType
    };
  }
};
