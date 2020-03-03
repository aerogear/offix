import { ApolloQueueEntry, ApolloQueueEntryOperation } from "./ApolloOfflineTypes";
import { CacheUpdates, isClientGeneratedId } from "offix-cache";
import { FetchResult } from "apollo-link";
import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import traverse from "traverse";

export function addOptimisticResponse(apolloClient: ApolloClient<NormalizedCacheObject>, { op, qid }: ApolloQueueEntryOperation) {
  apolloClient.store.markMutationInit({
    mutationId: qid,
    document: op.mutation,
    variables: op.variables,
    updateQueries: {},
    update: op.update,
    optimisticResponse: op.optimisticResponse
  });
  apolloClient.queryManager.broadcastQueries();
}

export function removeOptimisticResponse(apolloClient: ApolloClient<NormalizedCacheObject>, { op, qid }: ApolloQueueEntryOperation) {
  apolloClient.store.markMutationComplete({
    mutationId: qid,
    optimisticResponse: op.optimisticResponse
  });
  apolloClient.queryManager.broadcastQueries();
}

export function restoreOptimisticResponse(
  apolloClient: ApolloClient<NormalizedCacheObject>,
  mutationCacheUpdates: CacheUpdates,
  { op, qid }: ApolloQueueEntryOperation) {
  if (op.context.operationName && mutationCacheUpdates[op.context.operationName]) {
    op.update = mutationCacheUpdates[op.context.operationName];
    addOptimisticResponse(apolloClient, { op, qid });
  }
}

/**
 * Imagine we do a mutation that creates a new object while offline.
 * This object is given a temporary client generated ID.
 * If we do subsequent edits to that object, those edits will also reference the client generated ID.
 * Once the initial mutation to create the object is successful,
 * we need to update all references in the queue to the client generated ID
 * with the actual ID returned from the server.
 */
export function replaceClientGeneratedIDsInQueue(queue: ApolloQueueEntry[], operation: ApolloQueueEntryOperation, result: FetchResult) {
  if (!operation.op) {
    return;
  }
  const op = operation.op;
  const operationName = op.context.operationName as string;
  const optimisticResponse = op.optimisticResponse as {[key: string]: any};
  const idField = op.context.idField || "id";

  if (!result || !optimisticResponse || !optimisticResponse[operationName]) {
    return;
  }

  let optimisticId = optimisticResponse[operationName][idField];
  let resultId = result && result.data && result.data[operationName] && result.data[operationName][idField]

  if (!optimisticId || !resultId) {
    return;
  }

  if (isClientGeneratedId(optimisticResponse[operationName][idField])) {
    queue.forEach((entry) => {
      // replace all instances of the optimistic id in the queue with
      // the new id that came back from the server
      traverse(entry.operation.op).forEach(function(val) {
        if (val.toString() === optimisticId.toString()) {
          this.update(resultId)
        }
      })
    });
  }
}
