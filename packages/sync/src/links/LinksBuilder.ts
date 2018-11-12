import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";

/**
 * Function used to build apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for the users
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: DataSyncConfig): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config);
    }

    const httpLink = new HttpLink({ uri: config.httpUrl });
    // TODO drop your links here
    let compositeLink = ApolloLink.from([httpLink]);

    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query) as any;
          return kind === "OperationDefinition" && operation === "subscription";
        },
        wsLink,
        compositeLink
      );
    }
    return compositeLink;
  };
