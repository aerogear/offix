import { ConflictResolutionData } from "./ConflictResolutionData";
import { ObjectState } from "./ObjectState";

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
export class VersionedState implements ObjectState {

  public nextState(currentObjectState: ConflictResolutionData) {
    currentObjectState.version = currentObjectState.version + 1;
    return currentObjectState;
  }

  public currentState(currentObjectState: ConflictResolutionData) {
    return currentObjectState.version;
  }
}
