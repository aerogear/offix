import { ApolloLink, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { ConflictLink, ObjectState } from "offix-offline";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { LocalDirectiveFilterLink } from "offix-offline";
import { isMutation, isOnlineOnly, isSubscription } from "offix-offline";
import { OfflineLink } from "offix-offline";
import { NetworkStatus, OfflineMutationsHandler, OfflineStore } from "offix-offline";
import { IDProcessor } from "offix-offline";
import { IResultProcessor } from "offix-offline";
import { BaseLink } from "offix-offline";
import { ConfigError } from "./config/ConfigError";

/**
 * Create offline link
 */
export const createOfflineLink = async (config: OffixClientConfig, store: OfflineStore) => {
  const resultProcessors: IResultProcessor[] = [
    new IDProcessor()
  ];
  return new OfflineLink(store, {
    listener: config.offlineQueueListener,
    networkStatus: config.networkStatus as NetworkStatus,
    resultProcessors
  });
};

/**
 * Create conflict link
 */
export const createConflictLink = async (config: OffixClientConfig) => {
  return new ConflictLink({
    conflictProvider: config.conflictProvider as ObjectState,
    conflictListener: config.conflictListener,
    conflictStrategy: config.conflictStrategy
  });
};

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 */
export const createCompositeLink = async (config: OffixClientConfig,
  offlineLink: ApolloLink,
  conflictLink: ApolloLink): Promise<ApolloLink> => {

  // Enable offline link only for mutations and onlineOnly
  const mutationOfflineLink = ApolloLink.split((op: Operation) => {
    return isMutation(op) && !isOnlineOnly(op);
  }, offlineLink);
  // TODO persist baselink
  const baseLink = new BaseLink(config.conflictProvider as ObjectState);
  const links: ApolloLink[] = [baseLink, mutationOfflineLink];
  links.push(conflictLink);
  const retryLink = ApolloLink.split(OfflineMutationsHandler.isMarkedOffline, new RetryLink(config.retryOptions));
  links.push(retryLink);

  const localFilterLink = new LocalDirectiveFilterLink();
  links.push(localFilterLink);

  if (config.terminatingLink) {
    links.push(config.terminatingLink);
  } else if (config.httpUrl) {
    const httpLink = new HttpLink({ uri: config.httpUrl }) as ApolloLink;
    links.push(httpLink);
  } else {
    throw new ConfigError("Missing url", "httpUrl");
  }

  return ApolloLink.from(links);
};
