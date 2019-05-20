import { ApolloLink, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { conflictLink, ObjectState } from "../conflicts";
import { DataSyncConfig } from "../config";
import { DefaultMetricsBuilder, MetricsBuilder } from "@aerogear/core";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { createUploadLink } from "apollo-upload-client";
import { isMutation, isOnlineOnly, isSubscription } from "../utils/helpers";
import { OfflineLink } from "../offline/OfflineLink";
import { NetworkStatus, OfflineMutationsHandler, OfflineStore } from "../offline";
import { IDProcessor } from "../cache/IDProcessor";
import { ConflictProcessor } from "../conflicts/ConflictProcesor";
import { IResultProcessor } from "../offline/procesors/IResultProcessor";

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
 * Provides comprehensive offline Link
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling and retrying
 */
export const compositeOfflineLink = async (config: DataSyncConfig, offlineLink: ApolloLink): Promise<ApolloLink> => {
  // Enable offline link only for mutations and onlineOnly
  const mutationOfflineLink = ApolloLink.split((op: Operation) => {
    return isMutation(op) && !isOnlineOnly(op);
  }, offlineLink);
  const retryLink = ApolloLink.split(OfflineMutationsHandler.isMarkedOffline, new RetryLink(config.retryOptions));
  const localFilterLink = new LocalDirectiveFilterLink();
  const compositeOfflineLink: ApolloLink = ApolloLink.from([mutationOfflineLink, retryLink, localFilterLink]);
  return compositeOfflineLink;
};