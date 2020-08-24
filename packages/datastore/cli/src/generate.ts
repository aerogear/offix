import { GraphbackPluginEngine } from "@graphback/core";
import { OffixDataSyncPlugin } from "./OffixDataSyncPlugin";
import { loadSchema } from "./utils";

export const generate = (schemaPath: string, outputPath: string) => {
    const schema = loadSchema(schemaPath);
    const pluginEngine = new GraphbackPluginEngine({
        schema,
        plugins: [
            new OffixDataSyncPlugin({ modelOutputDir: outputPath })
        ]
    });
    pluginEngine.createResources();
};
