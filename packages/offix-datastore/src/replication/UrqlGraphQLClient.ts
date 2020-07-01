import { Client, createClient } from "urql";
import { DocumentNode } from "graphql";

import { GraphQLClient } from "./GraphQLReplicator";

export class UrqlGraphQLClient implements GraphQLClient {
    private client: Client;

    constructor(url: string) {
        this.client = createClient({ url });
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
            const result = await this.client.query(query, variables).toPromise();
            return {
                data: result.data,
                errors: [result.error] // TODO define proper errors for error handling
            };
        } catch (error) {
            throw error;
        }
    }
}
