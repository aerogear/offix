import { CRUDEvents } from "./CRUDEvents";


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

}
