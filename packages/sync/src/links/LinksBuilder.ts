import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { conflictLink } from "../conflicts/conflictLink";
import { defaultWebSocketLink } from "./WebsocketLink";
import QueueLink from "../offline/QueueLink";
import { PersistentStore, PersistedData } from "../PersistentStore";
import NetworkStatus from "../offline/NetworkStatus";

/**
 * Function used to build apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig, storage: PersistentStore<PersistedData>) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for the users
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: DataSyncConfig, storage: PersistentStore<PersistedData>): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config, storage);
    }

    const httpLink = new HttpLink({ uri: config.httpUrl });
    // TODO drop your links here
    let compositeLink;

    const links: [ApolloLink] = [httpLink];
    const queueMutationsLink = new QueueLink(storage, "offline-mutation-store");

    // TODO to be replaced by network interface check when ready
    NetworkStatus.whenOnline(() => queueMutationsLink.open());
    NetworkStatus.whenOffline(() => queueMutationsLink.close());
    if (config.conflictStrategy) {
      links.unshift(conflictLink(config));
    }

    // TODO this only works for now because there is only one link.
    // Will need a better strategy for when there are multiple links passed wrt ordering.
    links.unshift(queueMutationsLink);
    compositeLink = ApolloLink.from(links);
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
