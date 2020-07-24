import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";
import { createJsonSchema } from "./json_schema";
import { isDataSyncClientModel } from "./utils";

export const OFFIX_DATASYNC_PLUGIN_NAME = "OffixDataSyncPlugin";

/**
 * This a graphback plugin which generates:
 * - model json schema
 * - model typings (comming soon)
 * - datasync config file
 * which are required by the offix-datasync for
 * every model annotated with @datasync-client in schema.
 */
export class OffixDataSyncPlugin extends GraphbackPlugin {
    private pluginConfig: Required<IOffixDataSyncPluginConfig>;

    constructor(config?: IOffixDataSyncPluginConfig) {
        super();

        if (!config) {
            throw new Error("Please supply Datasync-client plugin config");
        }
        if (!config?.jsonOutputFile) {
            throw new Error("Datasync-client plugin requires jsonOutputFile parameter");
        }

        this.pluginConfig = config as Required<IOffixDataSyncPluginConfig>;
    }

    public createResources(metadata: GraphbackCoreMetadata): void {
        const documents = this.getDocuments(metadata);
        // for now there are only json documents
        const jsonSchema = documents
            .map(doc => doc.json)
            .reduce((prev, cur) => ({ ...prev, ...cur }), {});
        writeFileSync(this.pluginConfig.jsonOutputFile, JSON.stringify(jsonSchema, null, 2));
    }

    public getDocuments(metadata: GraphbackCoreMetadata) {
        // TODO add types
        return metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model))
            .map(model => ({ json: createJsonSchema(model) }));
    }

    public getPluginName(): string {
        return OFFIX_DATASYNC_PLUGIN_NAME;
    }
}
