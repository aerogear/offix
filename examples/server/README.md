# Graphback Runtime Server

Example server for Offix todo example app.

## Running server using Postgres

The project has been created using `graphback`. Run the project using the following steps. 
- Start the database
```
docker-compose up -d
```

- Start the server
```
yarn develop
```

## Running using SQLite3

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

- Start the server
```
yarn develop
```

Enjoy runtime app