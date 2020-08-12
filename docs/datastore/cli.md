---
id: cli
title: Datastore CLI
sidebar_label: Datastore CLI
---

## Using the CLI tool

We provide a graphback plugin to generate required config for datastore.
Read about graphback-cli [here](https://graphback.dev/docs/cli/graphback-cli).
The plugin generates a `schema.json` for models annotated with `@datasync-client` in your graphql schema.
Also, a `config.ts` file that instantiates all the models with default settings is generated.
You can import models from `config.ts` and start coding! 

### Installing the plugin

For npm
`npm install offix-datasync-client-plugin`
or yarn
`yarn add offix-datasync-client-plugin`

Add the plugin to your `.graphqlrc.yml`

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
