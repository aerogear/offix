
import { MutationUpdaterFn } from "apollo-client";

/**
 * Interface map mutation names to their respective update functions.
 * Developers can write cache updates for individual views
 * in form of object with keys referencing mutation names that are being used.
 *
 * For example:
 *
 * const taskUpdates =  {
 *  createTask: () => {...}
 * }
 */
interface CacheUpdates {
  [key: string]: MutationUpdaterFn;
}

export default CacheUpdates;
