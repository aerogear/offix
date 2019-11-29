import { OffixBoostOptions } from "./config/OffixBoostOptions";
import { OffixBoostConfig } from "./config/OffixBoostConfig";
import { ApolloOfflineClient } from "offix-client";
/**
* Factory for creating Apollo Offline Client
*
* @param userConfig options object used to build client
* @deprecated use OfflineClient class directly:
*  ```javascript
*  const offlineClient = new OfflineClient(config);
*  await offlineClient.init();
*  ```
*/
export const createClient = async (options: OffixBoostOptions): Promise<ApolloOfflineClient> => {
  const boostConfig = new OffixBoostConfig(options)
  const offlineClient = new ApolloOfflineClient(boostConfig);
  await offlineClient.init();
  return offlineClient;
};

export * from "./auth/AuthContextProvider";
export * from "offix-client";
export * from "./config/OffixBoostOptions";
export * from "./links";
