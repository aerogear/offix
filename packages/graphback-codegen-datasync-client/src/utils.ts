import { ModelDefinition } from "@graphback/core";
import { parseMetadata } from "graphql-metadata";

export const isDataSyncClientModel = (model: ModelDefinition) => {
    return parseMetadata("datasync-client", model.graphqlType);
};
