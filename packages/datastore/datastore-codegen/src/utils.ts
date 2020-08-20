import { ModelDefinition } from "@graphback/core";
import { parseMetadata } from "graphql-metadata";
import {
    isListType,
    getNamedType,
    isCompositeType,
    GraphQLType
} from "graphql";
import { mkdirSync } from "fs";

export const isDataSyncClientModel = (model: ModelDefinition) => {
    return parseMetadata("datasync", model.graphqlType);
};

export const makeDirIfNotExists = (path: string) => {
    try {
        mkdirSync(path);
    } catch (error) {
        // nothing to do here, the directory already exists
    }
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
    if (isCompositeType(type) || type.toString() === "ID" || type.toString() === "GraphbackObjectID") {
        return "string";
    }

    let tsType = type.name.toLowerCase();
    if (tsType === "int" || tsType === "float") {
        tsType = "number";
    } else if (tsType !== "string" && tsType !== "boolean") {
        tsType = "any";
    }

    return tsType;
};
