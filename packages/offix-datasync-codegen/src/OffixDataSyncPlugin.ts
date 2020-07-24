import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";
import { createJsonSchema } from "./json_schema";
import { isDataSyncClientModel } from "./utils";
import { validateOffixDataSyncPluginConfig } from "./OffixDataSyncPluginValidator";

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
        validateOffixDataSyncPluginConfig(config);
        this.pluginConfig = config as Required<IOffixDataSyncPluginConfig>;
    }

    public createResources(metadata: GraphbackCoreMetadata): void {
        const { modelOutputDir } = this.pluginConfig;
        const documents = this.getDocuments(metadata);
        // for now there are only json documents
        const jsonSchema = documents
            .map(doc => doc.json)
            .reduce((prev, cur) => ({ ...prev, ...cur }), {});

        const dataSyncConfig = this.getDataSyncConfig(metadata);

        writeFileSync(`${modelOutputDir}/schema.json`, JSON.stringify(jsonSchema, null, 2));
        writeFileSync(`${modelOutputDir}/config.ts`, dataSyncConfig);
    }

    public getDocuments(metadata: GraphbackCoreMetadata) {
        // TODO add types
        return metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model))
            .map(model => ({ json: createJsonSchema(model) }));
    }

    public getDataSyncConfig(metadata: GraphbackCoreMetadata) {
        const modelInitLines: string[] = [];

        metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model))
            .forEach((model) => {
                modelInitLines.push(`datastore.createModel(schema.${model.graphqlType.name});`);
            });

        const configCode = `import { DataStore } from 'offix-datastore';
import schema from './schema.json';

const datastore = new DataStore({
    dbName: "offix-datasync",
    clientConfig: {
      url: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
    }
});

${modelInitLines.join("\n")}

datastore.init();
`;
        return configCode;
    }

    public getPluginName(): string {
        return OFFIX_DATASYNC_PLUGIN_NAME;
    }
}
