import { StoreChangeEvent } from "../..";
import { Model } from "../../Model";


/**
 * Event used to notify mutation replication engine about new replication available
 */
export interface ReplicationChangesEvent extends StoreChangeEvent {
  /**
   * Model that will be used for replication
   */
  model: Model;
}
