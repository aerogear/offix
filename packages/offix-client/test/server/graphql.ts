import express from "express";
import { VoyagerServer } from "@aerogear/voyager-server";
import http from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

import { typeDefs, resolvers } from "./schema";

const PORT = 4000;

export function startServer() {
  const app = express();

  const apolloServer = VoyagerServer({ typeDefs, resolvers });
  const httpServer = http.createServer(app);
  apolloServer.applyMiddleware({ app });

  return new Promise(resolve => {
    httpServer.listen({ port: PORT }, async () => {
      const subscriptionServer = new SubscriptionServer({
        execute,
        subscribe,
        schema: apolloServer.schema
      }, {
        server: httpServer,
        path: "/graphql"
      });
      resolve(httpServer);
    });
  });
}
