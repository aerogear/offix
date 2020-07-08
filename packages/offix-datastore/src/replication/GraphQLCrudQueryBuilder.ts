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

            queriesMap.set(model.getStoreName(), { mutations });
        });

        return queriesMap;
    }
}
