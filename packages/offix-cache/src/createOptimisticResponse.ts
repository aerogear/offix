import { getOperationFieldName } from "./utils/helperFunctions";
import { CacheOperation } from "./api/CacheOperation";
import { generateClientId } from "./utils";
import { DocumentNode } from "graphql";
import { OperationVariables } from "apollo-client";
import { InputMapper } from "./createMutationOptions";

// export type OptimisticOptions = Omit<MutationHelperOptions, keyof MutationOptions |"updateQuery" | "context">;

export interface OptimisticOptions {
  mutation: DocumentNode;
  operationType: CacheOperation;
  returnType: string;
  idField?: string;
  variables?: OperationVariables;
  inputMapper?: InputMapper;
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
  // TODO things get really bad if returnType is not provided
  const {
    returnType,
    variables,
    idField = "id",
    operationType
  } = options;

  const optimisticResponse: any = {
    __typename: "Mutation"
  };

  let mappedVariables = variables;

  if (options.inputMapper) {
    mappedVariables = options.inputMapper.deserialize(variables);
  }

  optimisticResponse[operation] = {
    __typename: returnType,
    ...mappedVariables,
    optimisticResponse: true
  };
  if (operationType === CacheOperation.ADD && !optimisticResponse[operation][idField]) {
    optimisticResponse[operation][idField] = generateClientId();
  }

  return optimisticResponse;
};
