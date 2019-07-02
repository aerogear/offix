
import debug from "debug";
import { Operation } from "apollo-link";

export const logger = debug.default("AeroGearSync:Storage");

/**
 * Reads object from cache
 */
export const getObjectFromCache = (operation: Operation, id: string) => {
    const context = operation.getContext();

    if (context.cache && context.cache.data) {
      const cacheData = context.cache.data.data;
      const idKey = context.getCacheKey({ __typename: context.returnType, id });
      if (idKey && cacheData[idKey]) {
        return Object.assign({}, cacheData[idKey]);
      }
    } else {
      logger("Client is missing cache implementation. Conflict features will not work properly");
    }
    return {};
  };
