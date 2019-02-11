import { ApolloLink, concat } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { createHeadersLink } from "./HeadersLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { MetricsBuilder } from "@aerogear/core";
import { OfflineQueueLink } from "./OfflineQueueLink";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { createFileLink } from "./FileLink";
/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 * - Audit logging
 */
export const defaultHttpLinks = async (config: DataSyncConfig): Promise<ApolloLink[]> => {
  const offlineQueueLink = new OfflineQueueLink(config, "mutation");
  const localDirectiveFilterLink = new LocalDirectiveFilterLink();

  let httpLink = new HttpLink({ uri: config.httpUrl, includeExtensions: config.auditLogging }) as ApolloLink;
  if (config.headerProvider) {
    httpLink = concat(createHeadersLink(config), httpLink);
  }

  let links: ApolloLink[] = [offlineQueueLink,
    localDirectiveFilterLink,
    conflictLink(config),
    createFileLink(),
    httpLink];

  if (!config.conflictStrategy) {
    links = [offlineQueueLink, localDirectiveFilterLink, httpLink];
  }

  if (config.auditLogging) {
    const auditLoggingLink = await createAuditLoggingLink(config);
    links.unshift(auditLoggingLink);
  }

  return links;
};

export const createAuditLoggingLink = async (config: DataSyncConfig): Promise<AuditLoggingLink> => {
  const metricsBuilder: MetricsBuilder = new MetricsBuilder();
  const metricsPayload: {
    [key: string]: any;
  } = {};
  const metrics = metricsBuilder.buildDefaultMetrics();
  for (const metric of metrics) {
    metricsPayload[metric.identifier] = await metric.collect();
  }
  return new AuditLoggingLink(metricsBuilder.getClientId(), metricsPayload);
};
