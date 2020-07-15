import { CRUDEvents } from "./CRUDEvents";

/**
 * Type of event source - events can be triggered from user action or be result of the replication action
 */
export type StoreEventSource = "user" | "replication";

/**
 * StoreChangeEvent is an event emitted whenever
 * a change has occurred on the local store
*/
export interface StoreChangeEvent {
  /**
   * The type of change event that just occurred
   */
  eventType: CRUDEvents;

  /**
   * The data that was affected by the change
   */
  data: any;

  /**
   * The name store that was changed
   */
  storeName: string;


  /**
   * Source of the event gives ability to filter it out for different needs
   */
  eventSource: StoreEventSource;

}
