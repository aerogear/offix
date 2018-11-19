import ApolloClient from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OperationQueueEntry } from "./QueueLink";

export class SyncOfflineMutation {
    private apolloClient: ApolloClient<NormalizedCacheObject>;
    private storage: PersistentStore<PersistedData>;
    private storageKey: string;
    private offlineData: OperationQueueEntry[] = [];

    constructor(apolloClient: ApolloClient<NormalizedCacheObject>, storage: PersistentStore<PersistedData>, storageKey: string) {
        this.apolloClient = apolloClient;
        this.storage = storage;
        this.storageKey = storageKey;
    }

    public async init() {
        const stored = await this.getOfflineData();
        if (stored) {
            this.offlineData = JSON.parse(stored.toString());
        } else {
            this.offlineData = [];
        }
    }

    private getOfflineData = async () => {
        return this.storage.getItem(this.storageKey);
    }

    private hasOfflineData() {
        return !!(this.offlineData && this.offlineData.length > 0);
    }

    private clearOfflineData = async () => {
        this.offlineData = []
        return this.storage.removeItem(this.storageKey)
    }

    private addOfflineData = (queue: OperationQueueEntry[] = []) => {
        //add only if there is a value
        if (queue && queue.length > 0)
            this.storage.setItem(this.storageKey, JSON.stringify(queue))
    }

    public sync = async () => {
        //if there is no offline data  then just exit
        if (!this.hasOfflineData()) return

        //return as promise, but in the end clear the storage
        const uncommittedOfflineMutation: OperationQueueEntry[] = [];

        await Promise.all(this.offlineData.map(async (item) => {
            try {
                await this.apolloClient.mutate({
                    variables: item.operation.variables,
                    mutation: item.operation.query,
                    context: item.operation.getContext
                })
            }
            catch (e) {
                //set the errored mutation to the stash
                uncommittedOfflineMutation.push(item)
            }
        }))

        //wait before it was cleared
        await this.clearOfflineData()

        //then add again the uncommited storage
        this.addOfflineData(uncommittedOfflineMutation)

    }
}