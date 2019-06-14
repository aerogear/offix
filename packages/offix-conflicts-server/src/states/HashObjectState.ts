import { ObjectState } from "../api/ObjectState";
import { ObjectStateData } from "../api/ObjectStateData";

/**
 * Object state manager using a hashing method provided by user
 */
export class HashObjectState implements ObjectState {
  private hash: (object: any) => string;

  constructor(hashImpl: (object: any) => string) {
    this.hash = hashImpl;
  }

  public checkForConflict(serverState: ObjectStateData, clientState: ObjectStateData) {
    const filteredServerState: any = {};
    for (const field in clientState) {
      if (clientState.hasOwnProperty(field)) {
        filteredServerState[field] = serverState[field];
      }
    }
    if (this.hash(filteredServerState) !== this.hash(clientState)) {
      return true;
    }
    return false;
  }
}
