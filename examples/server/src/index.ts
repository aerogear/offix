import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"
import http from "http"
import knex from 'knex'
import * as config from '../graphback.json'
import { createRuntime } from './runtime'


export async function connect() {
  return knex({
    client: config.db.database,
    connection: config.db.dbConfig
  })
}

async function start() {
  const app = express()

  app.use(cors())

  // connect to db
  const client = await connect();
  const schema  = await createRuntime(client);

  const apolloConfig = {
    schema
  }

  const apolloServer = new ApolloServer(apolloConfig)

  apolloServer.applyMiddleware({ app })

  const httpServer = http.createServer(app)
  apolloServer.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: 4000 }, () => {
    // tslint:disable-next-line: no-console
    console.log(`🚀  Server ready at http://localhost:4000/graphql`)
  })
}

start();
