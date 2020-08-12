import gql from "graphql-tag";

import { Model } from "../../Model";
import { ReplicatorQueries } from "./ReplicatorQueries";

/**
 * Builds GraphQL queries for models following
 * the [GraphQLCRUD specification]{@link https://graphqlcrud.org/}
 */
export const buildGraphQLCRUDQueries = (model: Model) => {
  const fields: any = model.getFields();
  const fieldsBuilder: string[] = Object.keys(fields).map((key) => {
    const graphQLKey = fields[key].key;
    return graphQLKey;
  });
  const graphQLFields = fieldsBuilder.join("\n");
  const modelName = model.getName();

  const queries: ReplicatorQueries = {
    sync: gql`
            query sync${modelName}($lastChanged: String!, $filter: ${modelName}Filter) {
              find${modelName}s(lastChanged: $lastChanged, filter: $filter) {
                  items {
                    ${graphQLFields}
                  }
                  lastChanged
              }
            }`
  };
  return queries as ReplicatorQueries;
};

