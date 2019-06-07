import { MutationHelperOptions } from "../cache";
import { getOperationFieldName } from "../utils/helperFunctions";
import { CacheOperation } from "../cache/CacheOperation";
import { generateClientId } from "../utils";

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
 * @param operation operation that is being performed (update)
 * @param typeName type that is going to be returned
 * @param data actual data passed to function
 * @param addId generate client id for response
 * @param idField name of id field (default:id)
 */
export const createOptimisticResponse = (options: MutationHelperOptions) => {
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
