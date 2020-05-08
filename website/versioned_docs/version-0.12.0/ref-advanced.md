---
title: Cookbooks
sidebar_label: Offline Cookbook
id: cookbooks
---


# Offix Cookbook

This section contains multiple tips and tricks for working with Offix.


## Implementing Custom Network Status checks

To use your own custom network checks, implement the [NetworkStatus](NetworkStatus.ts)
 interface which provides two functions;

```javascript
  onStatusChangeListener(callback: NetworkStatusChangeCallback): void;

  isOffline(): boolean;
```

This interface can be used to redefine what being offline means. 
For example, for some use cases developers might decide to use scheduler only when Wifi connection is available.

## Querying Data when Offline

To make sure that data will be available when the devices comes back online, we need to query it with the proper 
`fetchPolicy`

We recommend to always use the default fetch policy and to let Offix to control the flow. However, for advanced use cases
developers can modify their approach. 

For more information see: 
https://medium.com/@wtr/data-query-patterns-for-graphql-clients-af66830531aa
