---
id: cli
title: Datastore CLI
sidebar_label: Datastore CLI
---

The Datastore CLI tool will generate JSON Schema files and types for your data models.

## Installing the CLI tool

You can install `datastore-cli` globally with npm:

`npm install -g datastore-cli`

or with yarn:

`yarn global add datastore-cli`


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

`datastore-cli generate --schema ./path/to/models --outputPath ./path/to/output/dir`
