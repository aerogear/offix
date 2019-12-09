import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { OffixBoostOptions } from "../config/OffixBoostOptions";
import { createAuthLink } from "./AuthLink";
import { createUploadLink } from "apollo-upload-client";
import { isSubscription } from "offix-client";
import { defaultWebSocketLink } from "./WebsocketLink";
/**
 * Method for creating "uber" composite Apollo Link implementation including:
 *
 * - Http support
 * - Websocket support
 * - Conflict resolution
 * - File uploads
 */
export function createDefaultLink(config: OffixBoostOptions): ApolloLink {
  let terminatingLink = createHTTPCompositeLink(config);
  if (config.wsUrl) {
    const wsLink = defaultWebSocketLink(config);
    terminatingLink = ApolloLink.split(isSubscription, wsLink, terminatingLink);
  }
  return terminatingLink;
}

/**
 * Default HTTP Apollo Links
 * creates a composite link containing the following
 *
 * - Auth Link
 * - HTTP Link
 * - File Upload Link
 */
function createHTTPCompositeLink(config: OffixBoostOptions): ApolloLink {

  const links: ApolloLink[] = [];

  if (config.authContextProvider) {
    links.push(createAuthLink(config));
  }

  if (config.fileUpload) {
    links.push(
      createUploadLink({
        uri: config.httpUrl
      })
    );
  } else {
    const httpLink = new HttpLink({
      uri: config.httpUrl
    }) as ApolloLink;
    links.push(httpLink);
  }

  return ApolloLink.from(links);
}
