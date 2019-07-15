import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictMetaData } from "./ConflictMetaData";

/**
 * Interface for strategy that can be used to resolve conflict
 */
export interface ConflictResolutionStrategy {
  /**
   * Strategy resolution method. This interface can be used to provide a custom way to deal with conflicts.
   *
   */
  resolve: (data: ConflictMetaData) => ConflictResolutionData;

}
