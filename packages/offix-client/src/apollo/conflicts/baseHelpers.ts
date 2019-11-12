import { MutationOptions } from "apollo-client";
import { ApolloCache } from "apollo-cache";
import {
  ObjectState,
  LocalConflictError,
  ConflictResolutionData
} from "offix-conflicts-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

/**
 * Convenience interface that specifies a few extra properties found on ApolloCache
 */
export interface ApolloCacheWithData extends ApolloCache<NormalizedCacheObject> {
  config: any;
  data: any;
  optimisticData: any;
}

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
export function getBaseStateFromCache(
  cache: ApolloCacheWithData,
  objectState: ObjectState,
  mutationOptions: MutationOptions
): ConflictResolutionData {
  const context = mutationOptions.context;
  const idField: string = context.idField || "id";
  const id: string = mutationOptions.variables && mutationOptions.variables[idField];

  if (!context.conflictBase) {
    // do nothing
    const conflictBase = getObjectFromCache(cache, context.returnType, id);
    if (conflictBase && Object.keys(conflictBase).length !== 0) {
      if (objectState.hasConflict(mutationOptions.variables, conflictBase)) {
        // 🙊 Input data is conflicted with the latest server projection
        throw new LocalConflictError(conflictBase, mutationOptions.variables);
      }
      return conflictBase;
    }
  }
}

function getObjectFromCache(cache: ApolloCacheWithData, typename: string, id: string) {
  if (cache && cache.data) {
    const idKey = cache.config.dataIdFromObject({ __typename: typename, id });

    if (cache.optimisticData && cache.optimisticData.parent) {
      const optimisticData = cache.optimisticData.parent.data;
      if (idKey && optimisticData[idKey]) {
        // return copy of original object
        return Object.assign({}, optimisticData[idKey]);
      }
    }
    const cacheData = cache.data.data;
    if (idKey && cacheData[idKey]) {
      // return copy of original object
      return Object.assign({}, cacheData[idKey]);
    }
  } else {
    console.warn("Client is missing cache implementation. Conflict features will not work properly");
  }
  return {};
}
