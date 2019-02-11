import { ApolloLink, concat } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { createHeadersLink } from "./HeadersLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { MetricsBuilder } from "@aerogear/core";
import { OfflineQueueLink } from "./OfflineQueueLink";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { createUploadLink } from "apollo-upload-client";

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

  let links: ApolloLink[] = [
    offlineQueueLink,
    localDirectiveFilterLink,
    conflictLink(config)
  ];

  if (config.auditLogging) {
    const auditLoggingLink = await createAuditLoggingLink(config);
    links = links.concat(auditLoggingLink);
  }

  if (config.headerProvider) {
    links = links.concat(createHeadersLink(config));
  }
  if (config.fileUpload) {
    links = links.concat(createUploadLink({
      uri: config.httpUrl,
      includeExtensions: config.auditLogging
    }));
  } else {
    const httpLink = new HttpLink({
      uri: config.httpUrl,
      includeExtensions: config.auditLogging
    }) as ApolloLink;
    links = links.concat(httpLink);
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
