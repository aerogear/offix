import { ConflictResolutionData } from "../strategies/ConflictResolutionData";

/**
 * Interface for handling state of the object.
 */
export interface ObjectState {

  /**
  * @param currentObjectState the object wish you would like to get the current state from
  */
  currentState(currentObjectState: ConflictResolutionData): ConflictResolutionData;

  /**
   * Takes server state and assigngs it to the client making sure
   * that client side data will not conflict when sending it to the server
   *
   * @param client - client side data
   * @param server - server side data
   */
  assignServerState(client: ConflictResolutionData, server: ConflictResolutionData): void;

  /***
   * Check if data conflicts with each other based on the object state information
   *
   * @param client - client side data
   * @param server - server side data
   * @returns true of data is conflicted
   */
  hasConflict(client: ConflictResolutionData, server: ConflictResolutionData): boolean;

  /**
   * Get's ignored fields that should be not taken into account when calculating diff.
   *
   * @return list of fields that should be ignored when calculating diff
   */
  getStateFields(): string[];

}
