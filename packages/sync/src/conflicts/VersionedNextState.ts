import { ConflictResolutionData } from "./ConflictResolutionData";
import { NextState } from "./NextState";

/**
 * Object state manager using a version field
 * Allows moving to next state using the version field of the object
 *
 * VersionedObjectState requires GraphQL types to contain version field.
 * For example:
 *
 * type User {
 *   id: ID!
 *   version: String
 * }
 */
export class VersionedNextState implements NextState {

  public nextState(currentObjectState: ConflictResolutionData) {
    currentObjectState.version = currentObjectState.version + 1;
    return currentObjectState;
  }
}
