import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for handling changing state of the object.
 */
export interface NextState {
  /**
   * @param currentObjectState the object wish you would like
   * to progress to its next state
   */
  nextState(currentObjectState: ConflictResolutionData): ConflictResolutionData;
}
