import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { OffixBoostOptions } from "../config/OffixBoostOptions";

export const createAuthLink = (config: OffixBoostOptions): ApolloLink => {
  const asyncHeadersLink = setContext(async (operation, previousContext) => {
    if (config.authContextProvider) {
      const { headers } = await config.authContextProvider();
      return {
        headers
      };
    }
  });
  return asyncHeadersLink;
};
