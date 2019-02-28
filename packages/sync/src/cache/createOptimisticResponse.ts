
const CLIENT_ID_PREFIX = "client:";

// Returns true if ID was generated on client
export const isClientGeneratedId = (id: string) => {
  return id && id.startsWith(CLIENT_ID_PREFIX);
};

// Helper method for ID generation ()
const generateId = (length = 8) => {
  let result = CLIENT_ID_PREFIX;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

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
 *
 *
 * @param operation operation that is being performed (update)
 * @param typeName type that is going to be returned
 * @param data actual data passed to function
 * @param addId generate client id for response
 * @param idField name of id field (default:id)
 */
export const createOptimisticResponse =
  (operation: string, typeName: string, data: any, addId: boolean = true, idField: string = "id") => {
    const optimisticResponse: any = {
      __typename: "Mutation"
    };

    optimisticResponse[operation] = {
      __typename: typeName,
      ...data,
      optimisticResponse: true
    };
    if (addId) {
      optimisticResponse[operation][idField] = generateId();
    }

    return optimisticResponse;
  };
