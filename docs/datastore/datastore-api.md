---
id: datastore-api
title: DataStore
sidebar_label: DataStore
---

The `DataStore` object initializes the storage layer, replication layer and the Models.
It accepts some options on creation.

| Input | Type | Description |
| ----- | ---- | ----------- |
| config | [DataStoreConfig](#DataStoreConfig) | Configuration Options |
| customEngines | ?[CustomEngies](#CustomEngines) | Custom storage and replication implementation |

### DataStoreConfig

Configuration options for `DataStore`.

| Input | Type | Description |
| ----- | ---- | ----------- |
| dbName | ?string | The Database name |
| schemaVersion | ?number | The Schema Version number. Used to trigger a Schema upgrade. Defaults to 1 |
| replicationConfig | ?[GlobalReplicationConfig](replication-api#GlobalReplicationConfig) | Configuration for Replication engine |

### CustomEngines

Custom implementation of Storage and Replicator.

| Input | Type | Description |
| ----- | ---- | ----------- |
| storeAdapter | ?[StorageAdapter](storage-api#StorageAdapter) | Custom storage adapter. By default DataStore will use IndexedDB that might not be available in every environment. If you wish to override adapter you can supply it here |
| replicator | ?[IReplicator](replication-api#IReplicator) | Custom replication mechanism that will replicate data. By default DataStore will be [GraphQL CRUD](https://graphqlcrud.org) replication mechanism |
