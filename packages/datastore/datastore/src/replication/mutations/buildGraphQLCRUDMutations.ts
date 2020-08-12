import gql from "graphql-tag";

import { Model } from "../../Model";
import { ReplicatorMutations } from "./ReplicatorMutations";

/**
 * Builds GraphQL mutations for models following
 * the [GraphQLCRUD specification]{@link https://graphqlcrud.org/}
 */
export const buildGraphQLCRUDMutations = (model: Model) => {
  const fields: any = model.getFields();
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

  return mutations as ReplicatorMutations;
};


