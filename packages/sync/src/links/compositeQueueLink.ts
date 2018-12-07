import { OfflineQueueLink, TYPE_MUTATION } from "./OfflineQueueLink";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { DataSyncConfig } from "../config";
import { ApolloLink, concat } from "apollo-link";

export const compositeQueueLink = (config: DataSyncConfig, filter?: TYPE_MUTATION): ApolloLink => {
  const offlineLink = new OfflineQueueLink(config, filter);
  offlineLink.openQueueOnNetworkStateUpdates();
  const localLink = new LocalDirectiveFilterLink();
  const compositeLink = concat(offlineLink, localLink);
  return compositeLink;
};
