import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for strategy that can be used to resolve conflict
 */
export interface ConflictResolutionStrategy {
  /**
   *
   * Strategy resolution method. This interface can be used to provide a custom way to deal with conflicts.
   *
   * @param base - base data before any client changes were applied
   * @param server - the latest server data returned to the client
   * @param client - the data the client tried to send to the server
   * @param operation - [optional] the name of the operation you wish to perform the strategy on.
   */
  resolve: (base: ConflictResolutionData,
            server: ConflictResolutionData,
            client: ConflictResolutionData,
            operation?: string) => ConflictResolutionData;

}
