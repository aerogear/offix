import { ObjectStateData } from "./ObjectStateData";
import { ObjectConflictError } from "./ObjectConflictError";

/**
 * Interface for handling changing state of the object.
 * Implementors can extend this interface to provide reliable way to
 * determine if object is in conflict and calculate next state
 * (version/hash etc.) that object should have after modification.
 */
export interface ObjectState {

  /**
   * Check for conflict for the data. If conflict existing error will be thrown to client to handle
   * the case
   *
   * @param serverState the data currently on the server
   * @param clientState the data the client wishes to perform some mutation with
   * @return ObjectConflictError when conflict happens or undefined otherwise
   */
  checkForConflict(serverState: ObjectStateData, clientState: ObjectStateData): ObjectConflictError | undefined;
}
