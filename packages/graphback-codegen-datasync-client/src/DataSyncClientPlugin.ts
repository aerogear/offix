import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { IDataSyncClientPluginConfig } from "./DataSyncClientConfig";
import { createJsonSchema } from "./json_schema";
import { isDataSyncClientModel } from "./utils";

export const DATASYNC_CLIENT_PLUGIN_NAME = "DataSyncClientPlugin";

/**
 * This a graphback plugin which generates:
 * - model json schema
 * - model typings (comming soon)
 * - datasync config file
 * which are required by the offix-datasync for
 * every model annotated with @datasync-client in schema.
 */
export class DataSyncClientPlugin extends GraphbackPlugin {
    private pluginConfig: Required<IDataSyncClientPluginConfig>;

    constructor(config?: IDataSyncClientPluginConfig) {
        super();

        if (!config) {
            throw new Error("Please supply Datasync-client plugin config");
        }
        if (!config?.jsonOutputFile) {
            throw new Error("Datasync-client plugin requires jsonOutputFile parameter");
        }

        this.pluginConfig = config as Required<IDataSyncClientPluginConfig>;
    }

    public createResources(metadata: GraphbackCoreMetadata): void {
        metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model))
            .map(model => ({ json: createJsonSchema(model) }));
    }

    public getPluginName(): string {
        return DATASYNC_CLIENT_PLUGIN_NAME;
    }
}
