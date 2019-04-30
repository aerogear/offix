import { OfflineQueueListener } from "./OfflineQueueListener";

export interface ListenerProvider {
  queueListeners: OfflineQueueListener[];
}
