import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for strategy that can be used to resolve conflict
 */
export interface ConflictResolutionStrategy {
  /**
   *
   * Strategy resolution method
   *
   * @param base - base data before both changes were applied
   * @param server - server data
   * @param client - client data
   */
  resolve: (base: ConflictResolutionData,
            server: ConflictResolutionData,
            client: ConflictResolutionData,
            operation?: string) => ConflictResolutionData;

}
