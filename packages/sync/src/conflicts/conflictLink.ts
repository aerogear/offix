import { onError } from "apollo-link-error";
import { GraphQLError } from "graphql";
import { DataSyncConfig } from "../config";
import { ApolloLink } from "apollo-link";
import { ConflictResolutionData } from "./ConflictResolutionData";

export const conflictLink = (config: DataSyncConfig): ApolloLink => {
  /**
  * Fetch conflict data from the errors returned from the server
  * @param graphQLErrors array of errors to retrieve conflicted data from
  */
  const getConflictData = (graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictResolutionData => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions) {
          // TODO need to add flag to check if conflict was resolved on the server
          if (err.extensions.exception.conflictInfo) {
            return err.extensions.exception.conflictInfo;
          }
        }
      }
    }
  };

  return onError(({ response, operation, forward, graphQLErrors }) => {
    const data = getConflictData(graphQLErrors);
    if (data && config.conflictStrategy && config.conflictStateProvider) {
      let resolvedConflict;
      if (data.resolvedOnServer) {
        resolvedConflict = data.serverData;
        // 🍴 eat error
        if (response) { response.errors = undefined; }
      } else {
        resolvedConflict = config.conflictStrategy(operation.operationName, data.serverData, data.clientData);
        resolvedConflict = config.conflictStateProvider.nextState(resolvedConflict);
      }
      if (config.conflictListener) {
        config.conflictListener.conflictOccurred(operation.operationName,
          resolvedConflict, data.serverData, data.clientData);
      }
      operation.variables = resolvedConflict;

      // Send update when resolved on client
      if (!data.resolvedOnServer) {
        return forward(operation);
      }
    }
  });
};
