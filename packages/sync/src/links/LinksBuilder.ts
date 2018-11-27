import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { conflictLink } from "../conflicts/conflictLink";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";
import QueueLink from "./QueueLink";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { NetworkInfo } from "../offline/NetworkStatus";

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
    let links: ApolloLink[] = [queueMutationsLink, conflictLink(config), httpLink];
    if (config.networkStatus) {
      config.networkStatus.onStatusChangeListener({
        onStatusChange(networkInfo: NetworkInfo) {
          if (networkInfo.online) {
            queueMutationsLink.open();
          } else {
            queueMutationsLink.close();
          }
        }
      }
      );
    }

    if (!config.conflictStrategy) {
      links = [queueMutationsLink, httpLink];
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
