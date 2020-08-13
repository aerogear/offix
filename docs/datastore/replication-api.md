---
id: replication-api
title: Replication
sidebar_label: Replication
---

### IReplicator

| Input | Type | Description |
| ----- | ---- | ----------- |

### GlobalReplicationConfig

Default configuration for replication engine.

| Input | Type | Description |
| ----- | ---- | ----------- |
| client | [GraphQLClientConfig](#GraphQLClientConfig) | URQL client specific configuration |
| delta | ?[DeltaQueriesConfig](#DeltaQueriesConfig) | Configuration for fetching delta changes from server |
| mutations | ?[MutationsConfig](#MutationsConfig) | Configuration for pushing mutations to server |
| liveupdates | ?[LiveUpdatesConfig](#LiveUpdatesConfig) | Configuration for live updates based on subscription |
| networkStatus | ?[NetworkStatus](#NetworkStatus) | Provides network status interface. By default platform will assume that deal with web interfaces. If you use react native you should override that with React Native specific interfaces. |