import { ConflictResolutionData } from "../strategies/ConflictResolutionData";
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

  public assignServerState(client: any, server: any): void {
    client.version = server.version;
  }
  public hasConflict(client: any, server: any): boolean {
    return client.version !== server.version;
  }
  public getStateFields(): string[] {
    // Id should be removed because we don't need to compare it for conflicts
    return  ["version", "id"];
  }

  public currentState(currentObjectState: ConflictResolutionData) {
    return currentObjectState.version;
  }
}
