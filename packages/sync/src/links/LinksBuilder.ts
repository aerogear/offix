import { ApolloLink, split } from "apollo-link";
import DebounceLink from "./DebounceLink";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { conflictLink } from "../conflicts/conflictLink";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";
import QueueLink from "./QueueLink";
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
    const queueMutationsLink = new QueueLink(storage, config.mutationsQueueName);
    const debounceLink = new DebounceLink();
    let links: ApolloLink[] = [queueMutationsLink, debounceLink, conflictLink(config), httpLink];

    // TODO to be replaced by network interface check when ready
    NetworkStatus.whenOnline(() => queueMutationsLink.open());
    NetworkStatus.whenOffline(() => queueMutationsLink.close());

    if (!config.conflictStrategy) {
      links = [queueMutationsLink, debounceLink, httpLink];
    }

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
