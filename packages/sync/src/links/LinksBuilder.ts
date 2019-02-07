import { ApolloLink, concat, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { createHeadersLink } from "./HeadersLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { MetricsBuilder } from "@aerogear/core";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { createUploadLink } from "apollo-upload-client";
import { isMutation, isOnlineOnly, isSubscription } from "../utils/helpers";
import { defaultWebSocketLink } from "./WebsocketLink";
import { OfflineLink } from "./OfflineLink";
import { RetryLink } from "./RetryLink";

export const defaultLink = async (config: DataSyncConfig) => {
  let link = await defaultHttpLinks(config);
  if (config.wsUrl) {
    const wsLink = defaultWebSocketLink(config, { uri: config.wsUrl });
    link = ApolloLink.split(isSubscription, wsLink, link);
  }
  return link;
};

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 * - Audit logging
 */
export const defaultHttpLinks = async (config: DataSyncConfig): Promise<ApolloLink> => {
  let links: ApolloLink[] = [];
  if (config.networkStatus) {
    const offlineLink = new OfflineLink({
      storage: config.storage,
      storageKey: config.mutationsQueueName,
      squashOperations: config.mergeOfflineMutations,
      listener: config.offlineQueueListener,
      networkStatus: config.networkStatus
    });
    const localDirectiveFilterLink = new LocalDirectiveFilterLink();
    let offlineLinks = ApolloLink.from([offlineLink, localDirectiveFilterLink]);

    offlineLinks = ApolloLink.split((op: Operation) => isMutation(op) && !isOnlineOnly(op), offlineLinks);
    links = [offlineLinks];
  }

  const retryLink = new RetryLink({});
  links.push(retryLink);

  if (config.auditLogging) {
    const auditLoggingLink = await createAuditLoggingLink(config);
    links = links.concat(auditLoggingLink);
  }

  if (config.authContextProvider) {
    links = links.concat(createHeadersLink(config));
  }

  if (config.conflictStrategy) {
    links = [...links, conflictLink(config)];
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

  return ApolloLink.from(links);
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
