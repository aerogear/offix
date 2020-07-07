
import { ObjectState, ConflictResolutionData } from "offix-client";

export class TimeStampState implements ObjectState {

  public assignServerState(client: any, server: any): void {
    client.updatedAt = server.updatedAt;
  }
  public hasConflict(client: any, server: any): boolean {
    return client.updatedAt !== server.updatedAt;
  }
  public getStateFields(): string[] {
    return  ["updatedAt"];
  }

  public currentState(currentObjectState: ConflictResolutionData) {
    return currentObjectState.updatedAt;
  }
}
