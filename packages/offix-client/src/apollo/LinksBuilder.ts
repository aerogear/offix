import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { OffixClientConfig } from "../config/OffixClientConfig";
import { isMarkedOffline } from "./helpers";
import { ConfigError } from "../config/ConfigError";

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 */
async function createCompositeLink(config: OffixClientConfig,
  conflictLink: ApolloLink): Promise<ApolloLink> {

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

export { createCompositeLink };
