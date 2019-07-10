import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { OffixClientConfig } from "../config/OffixClientConfig";

export const createAuthLink = (config: OffixClientConfig): ApolloLink => {
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
