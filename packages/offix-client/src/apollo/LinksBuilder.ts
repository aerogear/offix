import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { ApolloOfflineClientConfig } from "../config/ApolloOfflineClientConfig";
import { isMarkedOffline } from "./helpers";
import { ConfigError } from "../config/ConfigError";
import { ConflictLink } from "./conflicts/ConflictLink";
import { ObjectState } from "..";

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 */
function createDefaultLink(config: ApolloOfflineClientConfig) {

  const conflictLink = new ConflictLink({
    conflictProvider: config.conflictProvider as ObjectState,
    conflictListener: config.conflictListener,
    conflictStrategy: config.conflictStrategy
  });

  const links: ApolloLink[] = [conflictLink];
  const retryLink = ApolloLink.split(isMarkedOffline, new RetryLink(config.retryOptions));
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
}

export { createDefaultLink };
