import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";
import { createJsonSchema } from "./json_schema";
import { isDataSyncClientModel, makeDirIfNotExists } from "./utils";
import { validateOffixDataSyncPluginConfig } from "./OffixDataSyncPluginValidator";
import { createModelType } from "./generateTypes";

export const OFFIX_DATASYNC_PLUGIN_NAME = "OffixDataSyncPlugin";

/**
 * This a graphback plugin which generates:
 * - model json schema
 * - model typings
 * which are required by the offix-datasync for
 * every model annotated with @datasync-client in schema.
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
        writeFileSync(`${modelOutputDir}/schema/schema.json`, JSON.stringify(documents.json, null, 2));
        writeFileSync(`${modelOutputDir}/schema/index.ts`, documents.schemaExport);
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

        // TODO use actual model type instead of any for ModelJsonSchema
        const schemaExport = `import { ModelJsonSchema } from "offix-datastore";
import jsonSchema from "./schema.json";

type Schema<T = any> = {
    [P in keyof T]: ModelJsonSchema<any>
};

export const schema = jsonSchema as Schema;
`;

        const modelTypes = models.map(model => createModelType(model)).join("\n");

        return {
            json: jsonSchema,
            types: modelTypes,
            schemaExport
        };
    }

    public getPluginName(): string {
        return OFFIX_DATASYNC_PLUGIN_NAME;
    }
}
