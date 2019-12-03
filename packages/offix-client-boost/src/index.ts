import { OffixBoostOptions } from "./config/OffixBoostOptions";
import { OffixBoostConfig } from "./config/OffixBoostConfig";
import { ApolloOfflineClient } from "offix-client";

/**
* Create an ApolloOfflineClient with authentication, 
websockets and file uploads enabled
*
* @param options options object used to build client
*/
export const createClient = async (options: OffixBoostOptions): Promise<ApolloOfflineClient> => {
  const boostConfig = new OffixBoostConfig(options);
  const offlineClient = new ApolloOfflineClient(boostConfig);
  await offlineClient.init();
  return offlineClient;
};

export * from "./auth/AuthContextProvider";
export * from "offix-client";
export * from "./config/OffixBoostOptions";
export * from "./links";
