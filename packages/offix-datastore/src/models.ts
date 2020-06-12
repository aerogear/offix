import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { parseMarker } from "graphql-metadata";
import { getUserTypesFromSchema } from "@graphql-toolkit/common";

export interface Model {
    __typename: string;
}

export interface PersistedModel extends Model {
    id: string;
}

export function extractModelsFromSchema(schema: GraphQLSchema): Model[] {
    const types = getUserTypesFromSchema(schema);
    const userTypes = types.filter((modelType: GraphQLObjectType) => parseMarker("model", modelType.description));
    return userTypes.map((value) => {
        return {
            __typename: value.name
        };
    });
}
