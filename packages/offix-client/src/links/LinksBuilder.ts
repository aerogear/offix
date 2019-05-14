import { ApolloLink, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { conflictLink, ObjectState } from "../conflicts";
import { DataSyncConfig } from "../config";
import { createAuthLink } from "./AuthLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { DefaultMetricsBuilder, MetricsBuilder } from "@aerogear/core";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { createUploadLink } from "apollo-upload-client";
import { isMutation, isOnlineOnly, isSubscription } from "../utils/helpers";
import { defaultWebSocketLink } from "./WebsocketLink";
import { OfflineLink } from "../offline/OfflineLink";
import { NetworkStatus, OfflineMutationsHandler, OfflineStore } from "../offline";
import { IDProcessor } from "../cache/IDProcessor";
import { ConflictProcessor } from "../conflicts/ConflictProcesor";
import { IResultProcessor } from "../offline/procesors/IResultProcessor";

/**
 * Method for creating "uber" composite Apollo Link implementation including:
 *
 * - Http support
 * - Websocket support
 * - Offline handling
 * - Conflict resolution
 * - Audit logging
 * - File uploads
 */
export const createDefaultLink = async (config: DataSyncConfig, offlineLink: ApolloLink) => {
  let link = await defaultHttpLinks(config, offlineLink);
  if (config.wsUrl) {
    const wsLink = defaultWebSocketLink(config, { uri: config.wsUrl });
    link = ApolloLink.split(isSubscription, wsLink, link);
  }
  return link;
};

/**
 * Create offline link
 */
export const createOfflineLink = async (config: DataSyncConfig, store: OfflineStore) => {
  const resultProcessors: IResultProcessor[] = [
    new IDProcessor(),
    new ConflictProcessor(config.conflictStateProvider as ObjectState)
  ];
  return new OfflineLink({
    store,
    listener: config.offlineQueueListener,
    networkStatus: config.networkStatus as NetworkStatus,
    resultProcessors
  });
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
export const defaultHttpLinks = async (config: DataSyncConfig, offlineLink: ApolloLink): Promise<ApolloLink> => {
  // Enable offline link only for mutations and onlineOnly
  const mutationOfflineLink = ApolloLink.split((op: Operation) => {
    return isMutation(op) && !isOnlineOnly(op);
  }, offlineLink);
  const retryLink = ApolloLink.split(OfflineMutationsHandler.isMarkedOffline, new RetryLink(config.retryOptions));
  const localFilterLink = new LocalDirectiveFilterLink();
  const links: ApolloLink[] = [mutationOfflineLink, retryLink, localFilterLink];

  if (config.auditLogging) {
    links.push(await createAuditLoggingLink());
  }

  if (config.conflictStrategy) {
    links.push(conflictLink(config));
  }

  if (config.authContextProvider) {
    links.push(createAuthLink(config));
  }

  if (config.fileUpload) {
    links.push(createUploadLink({
      uri: config.httpUrl,
      includeExtensions: config.auditLogging
    }));
  } else {
    const httpLink = new HttpLink({
      uri: config.httpUrl,
      includeExtensions: config.auditLogging
    }) as ApolloLink;
    links.push(httpLink);
  }

  return ApolloLink.from(links);
};

const createAuditLoggingLink = async (): Promise<AuditLoggingLink> => {
  const metricsBuilder: MetricsBuilder = new DefaultMetricsBuilder();
  const metricsPayload: {
    [key: string]: any;
  } = {};
  const metrics = metricsBuilder.buildDefaultMetrics();
  for (const metric of metrics) {
    metricsPayload[metric.identifier] = await metric.collect();
  }
  return new AuditLoggingLink(metricsBuilder.getClientId(), metricsPayload);
};
