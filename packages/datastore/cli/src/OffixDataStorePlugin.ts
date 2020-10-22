import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataStorePluginConfig } from "./OffixDataStoreConfig";
import { createJsonSchema, createModelType } from "./generate-documents";
import { isDataSyncClientModel, makeDirIfNotExists } from "./utils";
import { validateOffixDataStorePluginConfig } from "./OffixDataStorePluginValidator";
import endent from "endent";

export const OFFIX_DATASYNC_PLUGIN_NAME = "OffixDataStorePlugin";

/**
 * This a graphback plugin which generates:
 * - model json schema
 * - model typings
 * which are required by the offix-datasync for
 * every model annotated with @datasync in schema.
 */
export class OffixDataStorePlugin extends GraphbackPlugin {
    private pluginConfig: Required<IOffixDataStorePluginConfig>;

    constructor(config?: IOffixDataStorePluginConfig) {
        super();
        validateOffixDataStorePluginConfig(config);
        this.pluginConfig = config as Required<IOffixDataStorePluginConfig>;
    }

    public createResources(metadata: GraphbackCoreMetadata): void {
        const { modelOutputDir } = this.pluginConfig;
        const documents = this.getDocuments(metadata);

        makeDirIfNotExists(modelOutputDir);
        writeFileSync(`${modelOutputDir}/schema.json`, JSON.stringify(documents.json, null, 2));
        writeFileSync(`${modelOutputDir}/index.ts`, documents.exports);
        writeFileSync(`${modelOutputDir}/types.ts`, documents.types);
    }

    public getDocuments(metadata: GraphbackCoreMetadata) {
        const models = metadata.getModelDefinitions();
            // .filter(model => isDataSyncClientModel(model));

        const modelJsonSchemas = models
            .map(model => (createJsonSchema(model)));

        // concatenate all the json documents
        const jsonSchema = modelJsonSchemas
            .reduce((prev, cur) => ({ ...prev, [cur.name]: cur }), {});

        const modelTypes = modelJsonSchemas
          .map(model => createModelType(model)).join("\n");

        const exports = endent`
          import { GeneratedModelSchema } from "offix-datastore";
          import jsonSchema from "./schema.json";

          export const schema = jsonSchema as GeneratedModelSchema;
          export * from "./types";
        `;

        return {
            json: jsonSchema,
            types: modelTypes,
            exports
        };
    }

    public getPluginName(): string {
        return OFFIX_DATASYNC_PLUGIN_NAME;
    }
}
