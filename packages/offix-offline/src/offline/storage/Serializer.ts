import { QueueEntry, QueueEntryOperation } from "../OfflineQueue";

export interface Serializer {
  serializeForStorage(entry: QueueEntryOperation): any
}

export const ApolloOperationSerializer = {
  serializeForStorage: ({ op, qid }: QueueEntryOperation) => {
    const { update, updateQuery, ...serialized} = op
    serialized.context.cache = null // TODO Fix me
    return serialized
  }
}