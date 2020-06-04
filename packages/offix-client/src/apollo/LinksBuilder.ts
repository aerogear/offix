import { ApolloLink } from "apollo-link";
import { RetryLink } from "apollo-link-retry";
import { ApolloOfflineClientConfig } from "../config/ApolloOfflineClientConfig";
import { isMarkedOffline } from "./helpers";

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Error handling
 */
function createDefaultLink(config: ApolloOfflineClientConfig) {

  const retryLink = ApolloLink.split(isMarkedOffline, new RetryLink(config.retryOptions));

  if (!config.link) {
    throw new Error("config missing link property");
  }

  const links: ApolloLink[] = [retryLink, config.link];

  return ApolloLink.from(links);
}

export { createDefaultLink };
