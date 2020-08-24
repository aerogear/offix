

/**
 * Extracts data from non generic return object from graphql query.
 * For example for
 * `data.createUser.{somedata}` will return `{somedata}`
 * @param result
 */
export const getFirstOperationData = (result: any) => {
  if (result.data) {
    const keys = Object.keys(result.data);
    if (keys.length !== 1) {
      return;
    }
    const firstOperationName = keys[0];
    return result.data[firstOperationName];
  }
}
