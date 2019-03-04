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
        resolvedConflict = data.serverState;
        if (response) {
          // Set data to resolved state
          response.data = resolvedConflict;
          // 🍴 eat error
          response.errors = undefined;
        }
        if (config.conflictListener) {
          config.conflictListener.conflictOccurred(operation.operationName,
            resolvedConflict, data.serverState, data.clientState);
        }
      } else {
        // resolve on client
        // ConflictResolutionStrategies interface is used
        if (config.conflictStrategy.strategies &&
          !!config.conflictStrategy.strategies[operation.operationName]) {
          const individualStrategy = config.conflictStrategy.strategies[operation.operationName];
          resolvedConflict = individualStrategy(data.serverState, data.clientState);
        } else if (config.conflictStrategy.default) {
          resolvedConflict = config.conflictStrategy.default(data.serverState, data.clientState);
        }

        if (config.conflictListener) {
          config.conflictListener.conflictOccurred(operation.operationName,
            resolvedConflict, data.serverState, data.clientState);
        }
        operation.variables = config.conflictStateProvider.nextState(resolvedConflict);
        if (response) {
          // 🍴 eat error
          response.errors = undefined;
        }
        return forward(operation);
      }
    }
  });
};
