import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

// Used as default strategy for SDK
export const clientWins: ConflictResolutionStrategy =
  (server: ConflictResolutionData, client: ConflictResolutionData) => {
    return client;
  };
