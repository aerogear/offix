const createOptimisticResponse = require("offix-client").createOptimisticResponse

export const deleteTask = (client, task) => {
  // 1. Execute mutation
  client.mutate({
    mutation: DELETE_TASK,
    variables: item,
    optimisticResponse:
      createOptimisticResponse('createTask', 'Task', item),
    update: taskCacheUpdate
  }).catch((error) => {
    // 2. Detect if this was an offline error
    if (error.networkError && error.networkError.offline) {
      const offlineError = error.networkError;
      // 3. We can still track when offline change is going to be replicated.
      offlineError.watchOfflineChange().then((result) => {
        console.log(result);
      })
    }
  });
}

export const DELETE_TASK = gql`
  mutation deleteTask($id: ID!){
    deleteTask(id: $id)
  }
`;

// Cache update function
const taskCacheUpdate = (cache, result) => {
  // TODO
  return {};
}

