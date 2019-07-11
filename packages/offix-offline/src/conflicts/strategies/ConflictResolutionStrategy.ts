import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictDataSet } from "./ConflictDataSet";

/**
 * Interface for strategy that can be used to resolve conflict
 */
export interface ConflictResolutionStrategy {
  /**
   * Strategy resolution method. This interface can be used to provide a custom way to deal with conflicts.
   *
   */
  resolve: (data: ConflictDataSet) => ConflictResolutionData;

}
