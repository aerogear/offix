import { ApolloLink, concat, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { defaultWebSocketLink } from "./WebsocketLink";
import { isSubscription } from "../utils/helpers";
import { createHeadersLink } from "./HeadersLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { MetricsBuilder } from "@aerogear/core";
import { OfflineQueueLink } from "./OfflineQueueLink";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";

export let offlineQueueLink: OfflineQueueLink;

/**
 * Function used to build Apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig) => Promise<ApolloLink>;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for:
 *
 * - Subscription handling
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 * - Audit logging
 */
export const defaultLinkBuilder: LinkChainBuilder =
  async (config: DataSyncConfig): Promise<ApolloLink> => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config);
    }

    offlineQueueLink = new OfflineQueueLink(config, "mutation");
    const localDirectiveFilterLink = new LocalDirectiveFilterLink();
    const localLink: ApolloLink = concat(offlineQueueLink, localDirectiveFilterLink);

    let httpLink = new HttpLink({ uri: config.httpUrl, includeExtensions: config.auditLogging }) as ApolloLink;
    if (config.headerProvider) {
      httpLink = concat(createHeadersLink(config), httpLink);
    }

    let links: ApolloLink[] = [localLink, conflictLink(config), httpLink];

    if (!config.conflictStrategy) {
      links = [localLink, httpLink];
    }

    await setupAuditLogging(config, links);

    let compositeLink = ApolloLink.from(links);
    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(isSubscription, wsLink, compositeLink);
    }
    return compositeLink;
  };

async function setupAuditLogging(config: DataSyncConfig, links: ApolloLink[]) {
  if (config.auditLogging) {
    const metricsBuilder: MetricsBuilder = new MetricsBuilder();
    const metricsPayload: {
      [key: string]: any;
    } = {};
    const metrics = metricsBuilder.buildDefaultMetrics();
    for (const metric of metrics) {
      metricsPayload[metric.identifier] = await metric.collect();
    }
    const auditLoggingLink =
      new AuditLoggingLink(metricsBuilder.getClientId(), metricsPayload);
    links.unshift(auditLoggingLink);
  }
}
