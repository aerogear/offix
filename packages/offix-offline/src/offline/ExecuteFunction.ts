import { QueueEntryOperation } from "./OfflineQueue";

export type ExecuteFunction<T> = (operation: QueueEntryOperation<T>) => Promise<any>;
