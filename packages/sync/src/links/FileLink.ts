import { createUploadLink } from "apollo-upload-client";
import { ApolloLink } from "apollo-link";

/**
 * Link for supporting file uploads
 */
export const createFileLink = (): ApolloLink => {
  return createUploadLink();
};
