import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

// Used as default strategy for SDK
export const diffMergeClientWins: ConflictResolutionStrategy =
  (server: ConflictResolutionData, client: ConflictResolutionData) => {
    return client;
  };
export const diffMergeServerWins: ConflictResolutionStrategy =
  (server: ConflictResolutionData, client: ConflictResolutionData) => {
    return server;
  };
