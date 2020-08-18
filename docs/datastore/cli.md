---
id: cli
title: Datastore CLI
sidebar_label: Datastore CLI
---

We provide a graphback plugin to generate required config for the DataStore.

## What is Graphback

Graphback simplifies application development by generating a production-ready API
from data models to access data from one or more data sources.
Graphback uses GraphQL and GraphQLCRUD to make it easy get the data you need,
and follows the convention over configuration paradigm to to reduce the amount of
setup and boilerplate costs associated with creating GraphQL applications.

Read about graphback-cli [here](https://graphback.dev/docs/cli/graphback-cli).

## Using the CLI tool

The plugin generates a `schema.json` for models annotated with `@datasync-client` in your graphql schema.
It also generates a `config.ts` file that instantiates all the models with default settings is generated.
You can import models from `config.ts` and start coding!

### Installing the plugin

For npm
`npm install --save-dev graphback-cli offix-datasync-client-plugin`
or yarn
`yarn add --dev graphback-cli offix-datasync-client-plugin`

Create your `.graphqlrc.yml`

```
schema: './src/schema.graphql'
extensions:
  graphback:
    # path to data model file(s)
    model: './src/model/runtime.graphql'
    plugins:
      offix-datasync-client-plugin:
        modelOutputDir: './src/datasync'
```

#### Plugin Options

`modelOutputDir` - The path to the folder where the generated config files will be saved.
This folder will be created if it doesn't exist.

`config.ts` will be generated in `<modelsOutputDir>/config.ts`.
Import models from this from this file in your code and start coding.

### Running the graphback generator

For npm,
`npm graphback generate`

for yarn,
`yarn graphback generate`
