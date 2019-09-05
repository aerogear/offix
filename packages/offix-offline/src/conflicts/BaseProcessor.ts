import { Operation } from "apollo-link";
import { isMutation } from "../utils/helpers";
import { getObjectFromCache } from "../utils/cacheHelper";
import { ObjectState } from "../conflicts/state/ObjectState";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";

/**
 * BaseProcessor takes an outgoing GraphQL operation and it checks if it
 * is a mutation on an object we already know about in our local cache
 * If it is, then we need to get the 'base' which is the original object we are trying to mutate
 * 
 * We first check for a 'local conflict' which happens when the base from the cache is different from
 * the 'version' the operation is trying to mutate. 
 * this can happen when the mutation is in flight but the cache was updated by subscriptions
 * 
 * If we have no local conflict, we add the original base to the operation's context,
 * which can then be used for conflict resolution later on.
 */
export class BaseProcessor {
  constructor(private stater: ObjectState) { }

  public getBaseState(operation: Operation): ConflictResolutionData {
      const idField = operation.getContext().idField || "id";
      const conflictBase = getObjectFromCache(operation, operation.variables[idField]);
      if (conflictBase && Object.keys(conflictBase).length !== 0) {
        if (this.stater.hasConflict(operation.variables, conflictBase)) {
          // 🙊 Input data is conflicted with the latest server projection
          throw new LocalConflictError(conflictBase, operation.variables)
        }
        return conflictBase
      }
    }
}

/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 * 
 * Local conflict happens when user opens view with cached data and in the mean time
 * cache gets updated by subscriptions. In this case it makes no sense to send request to server as we know
 * that data was outdated. Developers need to handle this use case instantly
 * (instead enqueuing data for offline processing)
 */
export class LocalConflictError extends Error {
  /**
   * Flag used to recognize this type of error
   */
  public localConflict = true;

  constructor(public conflictBase: any, public variables: any) {
    super();
  }
}
