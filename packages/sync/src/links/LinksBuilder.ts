import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { defaultWebSocketLink } from "./WebsocketLink";
import { OfflineQueueLink } from "./OfflineQueueLink";
import { isSubscription } from "../utils/helpers";

/**
 * Function used to build Apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for:
 *
 * - Subscription handling
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: DataSyncConfig): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config);
    }
    const httpLink = new HttpLink({ uri: config.httpUrl });
    const queueMutationsLink = new OfflineQueueLink(config, "mutation");
    // Enable network based queuing
    queueMutationsLink.openQueueOnNetworkStateUpdates();

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
