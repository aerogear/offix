import { ModelDefinition } from "@graphback/core";
import { parseMetadata } from "graphql-metadata";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import {
    isListType,
    getNamedType,
    isCompositeType,
    GraphQLType,
    buildSchema,
    buildASTSchema
} from "graphql";
import { mkdirSync, existsSync, lstatSync, readFileSync } from "fs";
import { join } from "path";

export const isDataSyncClientModel = (model: ModelDefinition) => {
    return parseMetadata("datasync", model.graphqlType);
};

export const makeDirIfNotExists = (path: string) => {
    try {
        mkdirSync(path, { recursive: true });
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

/**
 * Loads the schema object from the directory or URL
 *
 * @export
 * @param {string} modelDir
 * @returns {string}
 */
export function loadSchema(modelPath: string) {
    const fullModelPath = join(process.cwd(), modelPath);
    if (
        typeof modelPath === "string" &&
        existsSync(fullModelPath) &&
        lstatSync(fullModelPath).isDirectory()
    ) {
        const typesArrary = loadFilesSync(modelPath, { extensions: ["graphql"] });
        return buildASTSchema(mergeTypeDefs(typesArrary));
    }

    const schema = readFileSync(modelPath).toString();
    return buildSchema(schema);
}
