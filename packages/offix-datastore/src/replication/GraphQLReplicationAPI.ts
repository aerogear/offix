import { DocumentNode } from "graphql";

import { IReplicationAPI } from "./ReplicationAPI";
import { StoreChangeEvent } from "../storage";
import { Model } from "../Model";

/**
 * GraphQL mutations for create, update and delete 
 */
export interface Mutations {
    /**
     * GraphQL create mutation document
     */
    create: string | DocumentNode;

    /**
     * GraphQL update mutation document
     */
    update: string | DocumentNode;

    /**
     * GraphQL delete mutation document
     */
    delete: string | DocumentNode;
}

export interface GraphQLQueries {
    // TODO queries;
    mutations: Mutations;
    // TODO subsrciptions
}

/**
 * The GraphQLQueryBuilder is responsible for building GraphQLQueries
 */
export interface GraphQLQueryBuilder {
    /**
     * @returns a map of model names to their GraphQLQueries
     */
    build(models: Model<unknown>[]): Map<string, GraphQLQueries>;
}

export class GraphQLReplicationAPI implements IReplicationAPI {
    private queries: Map<string, GraphQLQueries>;

    constructor(queries: Map<string, GraphQLQueries>) {
        this.queries = queries;
    }

    public async push(event: StoreChangeEvent) {
        return {
            data: null,
            errors: [],
        }
    }
}
