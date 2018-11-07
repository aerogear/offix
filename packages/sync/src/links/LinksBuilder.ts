import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { IDataSyncConfig } from "../config/DataSyncClientConfig";

/**
 * Function used to build apollo link
 */
export type LinkChainBuilder = (config: IDataSyncConfig) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for the users
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: IDataSyncConfig): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config);
    }
    const httpLink = new HttpLink({ uri: config.httpUrl });
    return ApolloLink.from([httpLink]);
  };
