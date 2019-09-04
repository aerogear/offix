import debug from "debug";
import { Operation } from "apollo-link";

const logger = debug.default("Offix:Helpers");

/**
 * Reads object from cache
 */
export const getObjectFromCache = (operation: Operation, id: string) => {
  const context = operation.getContext();

  if (context.cache && context.cache.data) {
    if (!context.isOffline) {
      const idKey = context.cache.config.dataIdFromObject({ __typename: context.returnType, id })
      // const idKey = context.getCacheKey({ __typename: context.returnType, id });
      if (context.cache.optimisticData && context.cache.optimisticData.parent) {
        const optimisticData = context.cache.optimisticData.parent.data;
        if (idKey && optimisticData[idKey]) {
          // return copy of original object
          return Object.assign({}, optimisticData[idKey]);
        }
      }
      const cacheData = context.cache.data.data;
      if (idKey && cacheData[idKey]) {
        // return copy of original object
        return Object.assign({}, cacheData[idKey]);
      }
    }
  } else {
    logger("Client is missing cache implementation. Conflict features will not work properly");
  }
  return {};
};
