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
"""
  @model
  @datasync
"""
type Task {
    id: ID!
    title: String
    description: String
    numberOfDaysLeft: Number
}
```

The `@model` indicates that `Task` is a data model. `@datasync` indicates that `Task` has `datasync` enabled.


## Running the Datastore CLI

`datastore-cli generate --schema ./path/to/models --outputPath ./path/to/output/dir`
