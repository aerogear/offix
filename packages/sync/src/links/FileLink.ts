import { createUploadLink } from "apollo-upload-client";

import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { DataSyncConfig } from "../config/DataSyncConfig";

export const createFileLink = (config: DataSyncConfig): ApolloLink => {
  /**
   * Link for supporting file uploads
   */
  const uploadLink = createUploadLink({ uri: config.httpUrl });
  return uploadLink;
};


