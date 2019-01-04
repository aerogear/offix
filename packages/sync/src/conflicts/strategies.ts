import { ConflictResolutionData } from "./ConflictResolutionData";

// Used as default strategy for SDK
export const diffMergeClientWins = (server: ConflictResolutionData, client: ConflictResolutionData) => {
  return client;
};
export const diffMergeServerWins = (server: ConflictResolutionData, client: ConflictResolutionData) => {
  return server;
};
