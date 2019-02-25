import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for handling state of the object.
 */
export interface ObjectState {
  /**
   * @param currentObjectState the object wish you would like
   * to progress to its next state
   */
  nextState(currentObjectState: ConflictResolutionData): ConflictResolutionData;

   /**
   * @param currentObjectState the object wish you would like to get the current state from
   */
  currentState(currentObjectState: ConflictResolutionData): ConflictResolutionData;
}
