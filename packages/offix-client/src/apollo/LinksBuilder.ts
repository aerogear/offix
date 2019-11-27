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

  const retryLink = ApolloLink.split(isMarkedOffline, new RetryLink(config.retryOptions));

  let terminatingLink = config.terminatingLink;

  if (!terminatingLink) {
    if (!config.httpUrl) {
      throw new ConfigError("Missing url", "httpUrl");
    }
    terminatingLink = new HttpLink({ uri: config.httpUrl });
  }

  const links: ApolloLink[] = [conflictLink, retryLink, terminatingLink];

  return ApolloLink.from(links);
}

export { createDefaultLink };
