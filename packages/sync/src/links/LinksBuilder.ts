import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts/conflictLink";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";
import QueueLink from "./QueueLink";
import { isSubscription } from "../utils/helpers";

/**
 * Function used to build Apollo link
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

    const queueMutationsLink = new QueueLink(config);
    let links: ApolloLink[] = [queueMutationsLink, conflictLink(config), httpLink];

    if (!config.conflictStrategy) {
      links = [queueMutationsLink, httpLink];
    }

    let compositeLink = ApolloLink.from(links);
    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(isSubscription, wsLink, compositeLink);
    }
    return compositeLink;
  };
