import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for strategy that can be used to resolve conflict
 *
 * @param server - server data
 * @param client - client data
 */
export type ConflictResolutionStrategy =
  (server: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData;

/**
 * Interface for conflict handlers that can be used to resolve conflicts.
 * It is modeled as a Dictionary where the key is the operation name and the value is the conflict resolver function.
 */
export interface ConflictResolutionStrategies {
  default?: ConflictResolutionStrategy;
  strategies?: {
    [operationName: string]: ConflictResolutionStrategy
  };
}
