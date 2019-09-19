import { QueueEntryOperation } from "../OfflineQueue";

export interface Serializer {
  serializeForStorage(entry: QueueEntryOperation): any;
}
