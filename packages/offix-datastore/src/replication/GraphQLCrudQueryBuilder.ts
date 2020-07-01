import gql from "graphql-tag";

import { GraphQLQueryBuilder, GraphQLQueries } from "./GraphQLReplicationAPI";
import { Model } from "../Model";

export class GraphQLCrudQueryBuilder implements GraphQLQueryBuilder {
    build(models: Model<any>[]): Map<string, GraphQLQueries> {
        const queriesMap: Map<string, GraphQLQueries> = new Map();

        models.forEach((model) => {
            const fields = model.getFields();
            const fieldsBuilder: string[] = Object.keys(fields).map((key) => {
                const graphQLKey = fields[key].key;
                const graphQLType = fields[key].type;

                return `${graphQLKey}: ${graphQLType}`;
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
                    create${modelName}(input: $input) {
                        ${graphQLFields}
                    }
                }`,
                delete: gql`
                mutation delete${modelName}($input: Mutate${modelName}Input!) {
                    create${modelName}(input: $input) {
                        ${graphQLFields}
                    }
                }`,
            }

            queriesMap.set(modelName, { mutations });
        });

        return queriesMap;
    }
}
