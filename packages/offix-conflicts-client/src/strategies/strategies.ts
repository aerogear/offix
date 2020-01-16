import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

// Used as default strategy for SDK
export const UseClient: ConflictResolutionStrategy = {
  resolve: ({server, clientDiff}) => {
    return Object.assign(server, clientDiff);
  }
};
