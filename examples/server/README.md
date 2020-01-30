# Offix Todo Server

The example app makes use of a Graphback runtime server. For more information, visit the [graphback](https://github.com/aerogear/graphback) repo. Click here for the [runtime server](https://github.com/aerogear/graphback/tree/master/examples/runtime-example);

## Schema

The schema and resolvers are developed with the power of graphback. The model used to generate the schema and resolvers is available in the `model/runtime.graphql` file.

```
type Todo {
  id: ID!
  title: String
  description: String
  version: Int!
  completed: Boolean
}
```

## Running example using Postgres database 

Run the project using the following steps. 

- Start the database
```
docker-compose up -d
```

- Start the server
```
yarn develop
```

## Running example using SQLite database

The project has been created using `graphback`. Run the project using the following steps. 
- Modify the `graphback.json` config file. For an in memory sqlite database, use the following configuration, otherwise replace `:in-memory:` with the sqlite file to be used.
```
// change the db object
"db": {
  "dbConfig": {
    "filename": ":in-memory:"
  },
  "database": "sqlite3"
},
```

- Next modify the `runtime.ts` file and change the `PGKnexDataProvider` to `KnexDBDataProvider`.
```
...

import {
  ...
  KnexDBDataProvider
} from 'graphback'

...

const dbClientProvider = new KnexDBDataProvider(client);

...
```

- Start the server
```
yarn develop
```

If the server is being re-run, modify the `src/runtime.ts` and comment out the `migrateDb` function, since it will not be possible to re-migrate the database with SQLite3.