import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { DataSyncConfig } from "../config/DataSyncConfig";

export const createAuthLink = (config: DataSyncConfig): ApolloLink => {
  const asyncHeadersLink = setContext(async (operation, previousContext) => {
    if (config.authContextProvider) {
      const { header } = await config.authContextProvider();
      return {
        headers: header
      };
    }
  });
  return asyncHeadersLink;
};
