import { DocumentNode } from "graphql";
import { Model } from "../../Model";

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorMutations {
  /**
   * GraphQL create mutation document.
   * It takes an input variable which is the entity to be created
   */
  create: string | DocumentNode;

  /**
   * GraphQL update mutation document.
   * It takes an input variable which contains the
   * update to be made and the id of the entity to be updated
   */
  update: string | DocumentNode;

  /**
   * GraphQL delete mutation document.
   * It takes an input variable which contains
   * fields that match the entity to be deleted
   */
  delete: string | DocumentNode;
}

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorSubscriptions {
  /**
   * GraphQL create subscription document.
   */
  new: string | DocumentNode;

  /**
   * GraphQL update subscription document.
   */
  updated: string | DocumentNode;

  /**
   * GraphQL delete subscription document.
   */
  deleted: string | DocumentNode;
}

/**
 * GraphQL mutations for create, update and delete
 * TODO all the fields should be a ReplicatorSync Query
 */
export interface ReplicatorQueries {
  /**
   * FindQuery used to fetch data
   */
  find: string | DocumentNode;

  /**
   * GraphQL get operation
   */
  get: string | DocumentNode;

  /**
   * GraphQL sync operation
   */
  sync: string | DocumentNode;
}

export interface GraphQLDocuments {
  queries: ReplicatorQueries;
  mutations: ReplicatorMutations;
  subscriptions: ReplicatorSubscriptions;
}

/**
 * The GraphQLQueryBuilder is responsible for building GraphQLQueries
 */
export interface GraphQLDocumentsBuilder {
  /**
   * @returns a map of model store names to their GraphQLQueries
   */
  build(models: Model<unknown>[]): Map<string, GraphQLDocuments>;
}
