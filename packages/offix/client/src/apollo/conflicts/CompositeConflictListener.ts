import { ConflictListener, ConflictResolutionData } from "offix-conflicts-client";


/**
 * Composite Conflict Listener class that can accept register and remove individual listener functions as needed
 * Gets passed down to the conflict link
 */
export class CompositeConflictListener implements ConflictListener {

  private listeners: ConflictListener[] = [];

  addConflictListener(listener: ConflictListener) {
    this.listeners.push(listener);
  }

  removeConflictListener(listener: ConflictListener) {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  mergeOccurred(operationName: string, resolvedData: ConflictResolutionData, server: ConflictResolutionData, client: ConflictResolutionData) {
    for (const listener of this.listeners) {
      if (listener.mergeOccurred) {
        listener.mergeOccurred(operationName, resolvedData, server, client);
      }
    }
  }

  conflictOccurred(operationName: string, resolvedData: ConflictResolutionData, server: ConflictResolutionData, client: ConflictResolutionData) {
    for (const listener of this.listeners) {
      if (listener.conflictOccurred) {
        listener.conflictOccurred(operationName, resolvedData, server, client);
      }
    }
  }
}
