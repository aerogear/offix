import { GraphbackPlugin, GraphbackCoreMetadata } from "@graphback/core";
import { writeFileSync } from "fs";
import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";
import { createJsonSchema } from "./json_schema";
import { isDataSyncClientModel, makeDirIfNotExists } from "./utils";
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
        const dataSyncConfig = this.getDataSyncConfig(metadata);

        makeDirIfNotExists(modelOutputDir);
        makeDirIfNotExists(`${modelOutputDir}/schema`);
        writeFileSync(`${modelOutputDir}/schema/schema.json`, JSON.stringify(documents.json, null, 2));
        writeFileSync(`${modelOutputDir}/schema/index.ts`, documents.schemaExport);
        writeFileSync(`${modelOutputDir}/config.ts`, dataSyncConfig);
    }

    public getDocuments(metadata: GraphbackCoreMetadata) {
        const models = metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model));

        const modelJsonSchemas = models
            .map(model => (createJsonSchema(model)));
        // concatenate all the json documents
        const jsonSchema = modelJsonSchemas
            .reduce((prev, cur) => ({ ...prev, [cur.name]: cur }), {});

        // TODO use actual model type instead of any for DataSyncJsonSchema
        const schemaExport = `import { DataSyncJsonSchema } from "offix-datastore";
import jsonSchema from "./schema.json";

type Schema<T = any> = {
    [P in keyof T]: DataSyncJsonSchema<any>
};

export const schema = jsonSchema as Schema;
`;

        // TODO generate types

        return {
            json: jsonSchema,
            schemaExport
        };
    }

    public getDataSyncConfig(metadata: GraphbackCoreMetadata) {
        const modelInitLines: string[] = [];

        metadata.getModelDefinitions()
            .filter(model => isDataSyncClientModel(model))
            .forEach((model) => {
                const name = model.graphqlType.name;
                modelInitLines.push(`export const ${name}Model = datastore.createModel(schema.${name});`);
            });

        const configCode = `import { DataStore } from 'offix-datastore';
import { schema } from './schema';

export const datastore = new DataStore({
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
