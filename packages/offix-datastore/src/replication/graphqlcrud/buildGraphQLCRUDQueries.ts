import gql from "graphql-tag";

import { Model } from "../../Model";
import { GraphQLDocuments, ReplicatorQueries } from "../api/Documents";

/**
 * Builds GraphQL queries for models following
 * the [GraphQLCRUD specification]{@link https://graphqlcrud.org/}
 */
// TODO have static/precompiled gql queries instead of processing all at runtime
export const buildGraphQLCRUDQueries = (models: Model[]): Map<string, GraphQLDocuments> => {
  const queriesMap: Map<string, GraphQLDocuments> = new Map();

  models.forEach((model) => {
    const fields: any = model.schema.getFields();
    const fieldsBuilder: string[] = Object.keys(fields).map((key) => {
      const graphQLKey = fields[key].key;
      return graphQLKey;
    });
    const graphQLFields = fieldsBuilder.join("\n");
    const modelName = model.schema.getName();

    const mutations = {
      create: gql`
                mutation create${modelName}($input: Create${modelName}Input!) {
                    create${modelName}(input: $input) {
                        ${graphQLFields}
                    }
                }`,
      update: gql`
                mutation update${modelName}($input: Mutate${modelName}Input!) {
                    update${modelName}(input: $input) {
                        ${graphQLFields}
                    }
                }`,
      delete: gql`
                mutation delete${modelName}($input: Mutate${modelName}Input!) {
                    delete${modelName}(input: $input) {
                        ${graphQLFields}
                    }
                }`
    };

    const queries: ReplicatorQueries = {
      // TODO create a GraphQLCrudQuery class implementing ReplicatorQuery
      // these fields should be instances of said class
      // TODO this requires using pluralize as plural form will not always be the same.
      find: gql`
            query find${modelName}($filter: ${modelName}Filter, $page: PageRequest, $orderBy: OrderByInput) {
              find${modelName}s(filter: $filter, page: $page, orderBy: $orderBy) {
                  items {
                    ${graphQLFields}
                  }
                  offset
                  limit
              }
            }`,
      sync: gql`
            query sync${modelName}($lastChanged: String!, $filter: ${modelName}Filter) {
              find${modelName}s(lastChanged: $lastChanged, filter: $filter) {
                  items {
                    ${graphQLFields}
                  }
                  lastChanged
              }
            }`,
      // TODO validate if get is needed.
      get: gql`
            query get${modelName}($input: Mutate${modelName}Input!) {
                update${modelName}(input: $input) {
                    ${graphQLFields}
                }
            }`
    };

    // TODO do not build subscriptions if not needed.
    const subscriptions = {
      new: gql`
            subscription new${modelName}($filter: ${modelName}SubscriptionFilter) {
                new${modelName}(filter: $filter) {
                    ${graphQLFields}
                }
            }`,
      updated: gql`
            subscription updated${modelName}($filter: ${modelName}SubscriptionFilter) {
              updated${modelName}(filter: $filter) {
                    ${graphQLFields}
                }
            }`,
      deleted: gql`
            subscription deleted${modelName}($filter: ${modelName}SubscriptionFilter) {
                delete${modelName}(filter: $filter) {
                    ${graphQLFields}
                }
            }`
    };
    queriesMap.set(model.schema.getStoreName(), { mutations, subscriptions, queries });
  });

  return queriesMap;
};

