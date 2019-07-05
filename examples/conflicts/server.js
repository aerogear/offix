const express = require('express')
const queries = require('./queries')
const { VoyagerServer, gql } = require('@aerogear/voyager-server')
const { conflictHandler } = require('offix-conflicts-server')

// Types
const typeDefs = gql`
  type Greeting {
    msg: String
    ## Can be used to track conflicts
    version: Int
  }

  type Query {
    greeting: String
  }

  type Mutation {
    changeGreeting(msg: String!, version: Int!): Greeting
  }
`
// In Memory Data Source
let greeting = {
  msg: 'greeting from Voyager Server',
  version: 1
}

// Resolver functions. This is our business logic
const resolvers = {
  Mutation: {
    changeGreeting: async (obj, args, context, info) => {
      const conflictError = conflictHandler.checkForConflict(greeting, args);
      if (conflictError) {
        throw conflictError;
      }
      greeting = args;
      return greeting
    }
  },
  Query: {
    greeting: (obj, args, context, info) => {
      return greeting.msg
    }
  }
}

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = ({ req }) => {
  return {
    serverName: 'Voyager Server'
  }
}

// Initialize the voyager server with our schema and context
const apolloConfig = {
  typeDefs,
  resolvers,
  playground: {
    tabs: [{
      endpoint: '/graphql',
      variables: {},
      query: queries
    }]
  },
  context
}

const voyagerConfig = {
}

const server = VoyagerServer(apolloConfig, voyagerConfig)

const app = express()
server.applyMiddleware({ app })

module.exports = { app, server }
