import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

// Used as default strategy for SDK
export const UseClient: ConflictResolutionStrategy = {
  resolve: ({server, client, clientDiff}) => {
    return Object.assign(server, client, clientDiff);
  }
};
