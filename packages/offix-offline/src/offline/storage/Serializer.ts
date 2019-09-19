import { QueueEntryOperation } from "../OfflineQueue";

export interface Serializer<T> {
  serializeForStorage(entry: QueueEntryOperation<T>): any;
}
