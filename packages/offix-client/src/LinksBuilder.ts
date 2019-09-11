import { ApolloLink, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { isMutation } from "offix-offline";
import { OfflineMutationsHandler } from "offix-offline";
import { ConfigError } from "./config/ConfigError";

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

  // Enable offline link only for mutations
  const mutationOfflineLink = ApolloLink.split((op: Operation) => {
    return isMutation(op)
  }, offlineLink);
  const links: ApolloLink[] = [mutationOfflineLink];
  links.push(conflictLink);
  const retryLink = ApolloLink.split(OfflineMutationsHandler.isMarkedOffline, new RetryLink(config.retryOptions));
  links.push(retryLink);

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
