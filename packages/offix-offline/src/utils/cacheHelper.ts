import debug from "debug";
import { ApolloCache } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

// WTF do we name this
interface SpecialApolloCache extends ApolloCache<NormalizedCacheObject> {
  config: any;
  data: any;
  optimisticData: any;
}

export class CacheHelper {
  public cache?: SpecialApolloCache;
  public logger: any;

  public constructor(cache: ApolloCache<NormalizedCacheObject>, logger?: any) {
    this.cache = cache as SpecialApolloCache;
    this.logger = logger ? logger : debug.default("Offix:Helpers");
  }

  public getObjectFromCache(typename: string, id: string) {
    if (this.cache && this.cache.data) {
      const idKey = this.cache.config.dataIdFromObject({ __typename: typename, id });

      if (this.cache.optimisticData && this.cache.optimisticData.parent) {
        const optimisticData = this.cache.optimisticData.parent.data;
        if (idKey && optimisticData[idKey]) {
          // return copy of original object
          return Object.assign({}, optimisticData[idKey]);
        }
      }
      const cacheData = this.cache.data.data;
      if (idKey && cacheData[idKey]) {
        // return copy of original object
        return Object.assign({}, cacheData[idKey]);
      }
    } else {
      this.logger("Client is missing cache implementation. Conflict features will not work properly");
    }
    return {};
  }
}

// /**
//  * Reads object from cache
//  */
// export const getObjectFromCache = (operation: Operation, id: string) => {

//   if (context.cache && context.cache.data) {
//     if (!context.isOffline) {
//       const idKey = context.cache.config.dataIdFromObject({ __typename: context.returnType, id })
//       // const idKey = context.getCacheKey({ __typename: context.returnType, id });
//       if (context.cache.optimisticData && context.cache.optimisticData.parent) {
//         const optimisticData = context.cache.optimisticData.parent.data;
//         if (idKey && optimisticData[idKey]) {
//           // return copy of original object
//           return Object.assign({}, optimisticData[idKey]);
//         }
//       }
//       const cacheData = context.cache.data.data;
//       if (idKey && cacheData[idKey]) {
//         // return copy of original object
//         return Object.assign({}, cacheData[idKey]);
//       }
//     }
//   } else {
//     logger("Client is missing cache implementation. Conflict features will not work properly");
//   }
//   return {};
// };
