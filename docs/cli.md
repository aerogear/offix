---
id: cli
title: Datastore CLI
sidebar_label: Datastore CLI
---

The Datastore CLI tool will generate JSON Schema files and types for your data models.

## Installing the CLI tool

You can install `@offix/cli` npm:

`npm install --save-dev @offix/cli`

or with yarn:

`yarn add --dev @offix/cli`


## Usage

You need a graphql schema containing your data models. We will use this sample graphql schema `model.graphql`:

```graphql
scalar GraphQLObjectID

"""
  @model
  @datasync
"""
type Task {
    _id: GraphQLObjectID!
    title: String
    description: String
    numberOfDaysLeft: Number
}
```

The `@model` indicates that `Task` is a data model. `@datasync` indicates that `Task` has `datasync` enabled.
The scalar `GraphQLObjectID` is the id type. `_id` will be used as the primary key in your local database.


## Running the Datastore CLI

With yarn:

`yarn offix generate ./path/to/models ./path/to/output/dir`

or with npx:

`npx offix generate ./path/to/models ./path/to/output/dir`

By default, `@offix/cli` assumes your models are in `./src/models` and
generates the output files in `./src/datasync/generated`.