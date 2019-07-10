import { getOperationFieldName } from "../utils/helperFunctions";
import { CacheOperation } from "../cache/CacheOperation";
import { generateClientId } from "../utils";
import { DocumentNode } from "graphql";
import { OperationVariables, MutationOptions } from "apollo-client";

// export type OptimisticOptions = Omit<MutationHelperOptions, keyof MutationOptions |"updateQuery" | "context">;

export interface OptimisticOptions {
  mutation: DocumentNode;
  operationType: CacheOperation;
  returnType: string;
  idField?: string;
  variables?: OperationVariables;
}

/**
 * Create optimistic response.
 * For example:
 *
  optimisticResponse: {
      __typename: "Mutation",
      updateComment: {
        id: commentId,
        __typename: "Comment",
        content: commentContent
      }
    }
 *
 * For more info and examples see:
 * https://www.apollographql.com/docs/react/features/optimistic-ui.html
 *
 * @param mutation operation that is being performed (update)
 * @param returnType type that is going to be returned
 * @param variables actual data passed to function
 * @param idField name of id field (default:id)
 * @param operationType the type of operation being returned
 */
export const createOptimisticResponse = (options: OptimisticOptions) => {
  const operation = getOperationFieldName(options.mutation);
  const {
    returnType,
    variables,
    idField = "id",
    operationType
  } = options;
  const optimisticResponse: any = {
    __typename: "Mutation"
  };

  optimisticResponse[operation] = {
    __typename: returnType,
    ...variables,
    optimisticResponse: true
  };
  if (operationType === CacheOperation.ADD) {
    optimisticResponse[operation][idField] = generateClientId();
  }

  return optimisticResponse;
};
