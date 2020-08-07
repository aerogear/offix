import gql from "graphql-tag";

import { Model } from "../../Model";
import { ReplicatorSubscriptions } from "./ReplicatorSubscriptions";

/**
 * Builds GraphQL queries for models following
 * the [GraphQLCRUD specification]{@link https://graphqlcrud.org/}
 */
export const buildGraphQLCRUDSubscriptions = (model: Model): ReplicatorSubscriptions => {

  const fields: any = model.getFields();
  const fieldsBuilder: string[] = Object.keys(fields).map((key) => {
    const graphQLKey = fields[key].key;
    return graphQLKey;
  });
  const graphQLFields = fieldsBuilder.join("\n");
  const modelName = model.getName();

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
  return subscriptions;
};

