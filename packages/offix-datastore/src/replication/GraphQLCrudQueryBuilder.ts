import gql from "graphql-tag";

import { GraphQLQueryBuilder, GraphQLQueries } from "./GraphQLReplicator";
import { Model } from "../Model";

/**
 * Builds GraphQL queries for models following
 * the [GraphQLCRUD specification]{@link https://graphqlcrud.org/}
 */
// TODO add deltaqueries/subscriptions
// TODO have static/precompiled gql queries instead of processing all at runtime
export class GraphQLCrudQueryBuilder implements GraphQLQueryBuilder {
  build(models: Model<any>[]): Map<string, GraphQLQueries> {
    const queriesMap: Map<string, GraphQLQueries> = new Map();

    models.forEach((model) => {
      const fields = model.getFields();
      const fieldsBuilder: string[] = Object.keys(fields).map((key) => {
        const graphQLKey = fields[key].key;
        return graphQLKey;
      });
      const graphQLFields = fieldsBuilder.join("\n");
      const modelName = model.getName();

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

      const queries = {
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
        get: gql`
            query get${modelName}($input: Mutate${modelName}Input!) {
                update${modelName}(input: $input) {
                    ${graphQLFields}
                }
            }`
      };

      const subscriptions = {
        new: gql`
            mutation new${modelName}($input: ${modelName}SubscriptionFilter) {
                new${modelName}(input: $input) {
                    ${graphQLFields}
                }
            }`,
        updated: gql`
            mutation updated${modelName}($input: ${modelName}SubscriptionFilter) {
              updated${modelName}(input: $input) {
                    ${graphQLFields}
                }
            }`,
        deleted: gql`
            mutation deleted${modelName}($input: ${modelName}SubscriptionFilter) {
                delete${modelName}(input: $input) {
                    ${graphQLFields}
                }
            }`
      };
      queriesMap.set(model.getStoreName(), { mutations, subscriptions, queries });
    });

    return queriesMap;
  }
}
