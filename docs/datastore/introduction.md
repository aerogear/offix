---
id: introduction
title: Introduction to Offix Datastore
sidebar_label: Offix Datastore
---

Offix Datastore is a fully capable client side store for
JavaScript apps with real-time synchronization over GraphQL.
Offix Datastore saves all your data locally and enables a GraphQL replication mechanism to your generic GraphQL server,
this way, your data is available with or without an internet connection.
All changes made locally, when offline, are queued until an internet connection is available.

### Key Features

#### Offline-first

Offix Datastore allows you to build "Offline-first" apps with ease.
User data is always available locally and the local database is
synchronized with server as soon as the user is online.

#### GraphQL CRUD compatible

Offix Datastore supports synchronization with [GraphQL CRUD](https://graphqlcrud.org/) compatible servers by default.
If your server doesn't support GraphQLCrud, you can build your own synchronization engine.

#### Browser and mobile support

Offix Datastore works on all devices so you can build seamless offline experiences on any device.
In the browser, Offix Datastore uses IndexedDB or WebSQL to persist data locally.
On mobile, Offix Datastore uses SQLite.

#### React Support

Offix Datastore provides hooks to help React devs build offline apps quickly. See [TODO link react docs here].
