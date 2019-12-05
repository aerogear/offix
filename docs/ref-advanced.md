---
id: cookbooks
title: Cookbooks
sidebar_label: Offline Cookbook
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

## Querying data when offiline

To make sure that data will be available when device will be going online we need to query it with the proper 
`fetchPolicy`

We recomend to always use default fetch policy and let offix to control the folow, however for advanced use cases
developers can modify their approach. 

For more information see: 
https://medium.com/@wtr/data-query-patterns-for-graphql-clients-af66830531aa
