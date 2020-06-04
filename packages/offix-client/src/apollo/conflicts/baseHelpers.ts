import { MutationOptions, OperationVariables } from "apollo-client";
import { ApolloCache } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { InputMapper } from "../../config/ApolloOfflineClientOptions";

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
 */
export function getBaseStateFromCache(
  cache: ApolloCacheWithData,
  mutationOptions: MutationOptions,
  inputMapper?: InputMapper
): any {
  const context = mutationOptions.context;

  if (!context.base) {

    let mutationVariables = mutationOptions.variables as OperationVariables;
    if (inputMapper) {
      mutationVariables = inputMapper.deserialize(mutationVariables);
    }

    return getObjectFromCache(cache, context.returnType, mutationVariables);
  }
}

function getObjectFromCache(cache: ApolloCacheWithData, typename: string, mutationVariables: OperationVariables) {
  if (cache && cache.data) {
    const idKey = cache.config.dataIdFromObject({ __typename: typename, ...mutationVariables });

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
    console.warn("Client is missing cache implementation");
  }
  return {};
}
