import { ApolloOfflineClient } from "./ApolloOfflineClient";
import { QueueEntryOperation } from "offix-offline";
import { MutationOptions } from "apollo-client";
import { CacheUpdates } from "offix-cache";

export function addOptimisticResponse(apolloClient: ApolloOfflineClient, { op, qid }: QueueEntryOperation<MutationOptions>) {
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

export function removeOptimisticResponse(apolloClient: ApolloOfflineClient, { op, qid }: QueueEntryOperation<MutationOptions>) {
  apolloClient.store.markMutationComplete({
    mutationId: qid,
    optimisticResponse: op.optimisticResponse
  });
  apolloClient.queryManager.broadcastQueries();
}

export function restoreOptimisticResponse(apolloClient: ApolloOfflineClient, mutationCacheUpdates: CacheUpdates, { op, qid }: QueueEntryOperation<MutationOptions>) {
  if (op.context.operationName && mutationCacheUpdates[op.context.operationName]) {
    op.update = mutationCacheUpdates[op.context.operationName]
    addOptimisticResponse(apolloClient, { op, qid })
  }
}