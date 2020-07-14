import { Client, createClient, subscriptionExchange, defaultExchanges } from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { DocumentNode } from "graphql";
import { pipe, subscribe } from "wonka";

import { GraphQLClient } from "./GraphQLReplicator";

export class UrqlGraphQLClient implements GraphQLClient {
    private client: Client;

    constructor(url: string, wsUrl: string | undefined) {
        if (!wsUrl) {
          this.client = createClient({ url });
        } else {
          const subscriptionClient = new SubscriptionClient(wsUrl, { reconnect: true });
          const exchanges = [
            ...defaultExchanges,
            subscriptionExchange({
              forwardSubscription: operation => {
                return subscriptionClient.request(operation);
              }
            })
          ];
          this.client = createClient({ url, exchanges });
        }
    }

    async query(query: string | DocumentNode, variables?: any) {
        try {
            const result = await this.client.query(query, variables).toPromise();
            return {
                data: result.data,
                errors: [result.error] // TODO define proper errors for error handling
            };
        } catch (error) {
            throw error;
        }
    }

    async mutate(query: string | DocumentNode, variables?: any) {
        try {
            const result = await this.client.mutation(query, variables).toPromise();
            return {
                data: result.data,
                errors: [result.error] // TODO define proper errors for error handling
            };
        } catch (error) {
            throw error;
        }
    }

    public subscribe(query: DocumentNode) {
      return pipe(
        this.client.subscription(query),
        subscribe(result => {
          return {
            data: result.data,
            errors: [result.error] // TODO define proper errors for error handling
          };
        })
      );
    }
}
