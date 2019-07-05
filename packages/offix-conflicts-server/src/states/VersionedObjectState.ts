import { ObjectState } from "../api/ObjectState";
import { ObjectStateData } from "../api/ObjectStateData";
import { ObjectConflictError } from "../api/ObjectConflictError";
import { conflictHandler } from "..";

/**
 * Object state manager using a version field
 * Detects conflicts and allows moving to next state using the version field of the object
 *
 * VersionedObjectState requires GraphQL types to contain version field.
 * For example:
 *
 * type User {
 *   id: ID!
 *   version: String
 * }
 */
export class VersionedObjectState implements ObjectState {

  public checkForConflict(serverState: ObjectStateData, clientState: ObjectStateData) {
    if (serverState.version && clientState.version) {
      if (serverState.version !== clientState.version) {
        const filteredServerState: any = {};
        for (const key of Object.keys(clientState)) {
          filteredServerState[key] = serverState[key];
        }
        return new ObjectConflictError({
          serverState,
          clientState
        });
      }
    } else {
      throw new Error(`Supplied object is missing version field required to determine conflict.
      Server data: ${JSON.stringify(serverState)} Client data: ${JSON.stringify(clientState)}`);
    }
    this.nextState(clientState);
  }

  private nextState(currentObjectState: ObjectStateData) {
    if (currentObjectState.version) {
      currentObjectState.version = currentObjectState.version + 1;
    } else {
      currentObjectState.version = 1;
    }
    return currentObjectState;
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState();
