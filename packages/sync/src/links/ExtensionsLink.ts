import { ApolloLink } from "apollo-link";

/**
 * Purpose of this link is to restore persisted GraphQL extensions that were passed back to client as context.
 * See OfflineRestoreHandler that is passing extensions into context.
 */
export const extensionsLink = new ApolloLink((operation, forward) => {
  const extensions = operation.getContext().extensions;
  operation.extensions = extensions;

  if (forward) {
    return forward(operation);
  } else {
    return null;
  }
});
