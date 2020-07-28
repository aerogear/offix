import { ModelDefinition } from "@graphback/core";
import { parseMetadata } from "graphql-metadata";
import {
    isListType,
    getNamedType,
    isCompositeType,
    GraphQLType
} from "graphql";

export const isDataSyncClientModel = (model: ModelDefinition) => {
    return parseMetadata("datasync-client", model.graphqlType);
};

/**
 * Trys to convert the input graphql type to a ts type.
 * If the input type is composite or "ID",
 * "string" is returned instead to represent ids
 *
 * @param type
 * @returns the ts equivalent of the input graphql type
 */
export const convertToTsType = (type: GraphQLType): string => {
    if (isListType(type)) {
        return `${convertToTsType(getNamedType(type))}[]`;
    }
    if (isCompositeType(type) || type.toString() === "ID") {
        return "string";
    }
    return type.name.toLowerCase();
};
