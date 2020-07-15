import { Client, createClient, subscriptionExchange, defaultExchanges } from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { DocumentNode } from "graphql";
import { pipe, subscribe } from "wonka";
import { GraphQLClient } from "../api/GraphQLClient";
import Observable from "zen-observable";

export class UrqlGraphQLClient implements GraphQLClient {
  private client: Client;

  constructor(url: string, wsUrl: string | undefined) {
    if (wsUrl) {
      // TODO authentication support for subscriptions
      const subscriptionClient = new SubscriptionClient(wsUrl, {
        reconnect: true, lazy: false,
        reconnectionAttempts: 10000000,
        inactivityTimeout: 100,
        // TODO hook into reconnect to reinitialize work
        connectionCallback: undefined
      });
      const exchanges = [
        ...defaultExchanges,
        subscriptionExchange({
          forwardSubscription: operation => {
            return subscriptionClient.request(operation);
          }
        })
      ];
      this.client = createClient({ url, exchanges });
    } else {
      this.client = createClient({ url });
    }
  }

  async query(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.query(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  async mutate<T>(query: string | DocumentNode, variables?: any) {
    try {
      const result = await this.client.mutation(query, variables).toPromise();
      return {
        data: result.data,
        errors: [result.error]
      };
    } catch (error) {
      return {
        errors: [error]
      };
    }
  }

  public subscribe<T>(query: DocumentNode) {
    return new Observable<T>(observer => {
      pipe(
        this.client.subscription(query),
        subscribe(result => {
          if (result.error) {
            observer.error(result.error);
          }
          if (result?.data) {
            observer.next(result.data);
          }
        })
      );
    });
  }
}
