---
id: introduction
title: Introduction to Offix Datastore
sidebar_label: Offix Datastore
---

Welcome to the Offix Datastore guide! Offix Datastore is a database for
JavaScript apps with real-time synchronization over GraphQL.
Offix Datastore saves all your data locally while pushing them your server,
this way, you data is available with or without an internet connection.
All changes made locally when offline are queued until an internet connection is available.

### Key Features

#### Offline-first

Offix Datastore allows you to build "Offline-first" apps with ease.
User data is always available locally and local database is
synchronized with server as soon as the user is online.

#### GraphQL CRUD compatible

Offix Datastore supports synchronization with [GraphQL CRUD](https://graphqlcrud.org/) compatible servers by default.
If your server doesn't support GraphQLCrud, you can build your synchronization engine.
[TODO link how to build replication engine here]

#### Browser and mobile support

Offix Datastore works on all devices so you can build seamless offline experience on any device.
In the browser, Offix Datastore uses IndexedDB or WebSQL to persist data locally.
On mobile, Offix Datastore uses SQLite.
