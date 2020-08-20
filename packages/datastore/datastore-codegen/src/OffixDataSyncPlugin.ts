import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";
import { createJsonSchema, createModelType } from "./generate-documents";
import { isDataSyncClientModel, makeDirIfNotExists } from "./utils";
import { validateOffixDataSyncPluginConfig } from "./OffixDataSyncPluginValidator";

export const OFFIX_DATASYNC_PLUGIN_NAME = "OffixDataSyncPlugin";

/**
 * This a graphback plugin which generates:
 * - model json schema
 * - model typings
 * which are required by the offix-datasync for
 * every model annotated with @datasync in schema.
 */
export class OffixDataSyncPlugin extends GraphbackPlugin {
    private pluginConfig: Required<IOffixDataSyncPluginConfig>;

    constructor(config?: IOffixDataSyncPluginConfig) {
        super();
        validateOffixDataSyncPluginConfig(config);
        this.pluginConfig = config as Required<IOffixDataSyncPluginConfig>;
    }

    public createResources(metadata: GraphbackCoreMetadata): void {
        const { modelOutputDir } = this.pluginConfig;
        const documents = this.getDocuments(metadata);

        makeDirIfNotExists(modelOutputDir);
        makeDirIfNotExists(`${modelOutputDir}/schema`);
        writeFileSync(`${modelOutputDir}/schema.json`, JSON.stringify(documents.json, null, 2));
        writeFileSync(`${modelOutputDir}/index.ts`, documents.exports);
        writeFileSync(`${modelOutputDir}/types.ts`, documents.types);
    }

    public getDocuments(metadata: GraphbackCoreMetadata) {
        const models = metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model));

        const modelJsonSchemas = models
            .map(model => (createJsonSchema(model)));
        // concatenate all the json documents
        const jsonSchema = modelJsonSchemas
            .reduce((prev, cur) => ({ ...prev, [cur.name]: cur }), {});
        const modelTypes = models.map(model => createModelType(model)).join("\n");

        // TODO use actual model type instead of any for ModelJsonSchema
        const exports = `import { GeneratedModelSchema } from "offix-datastore";
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
