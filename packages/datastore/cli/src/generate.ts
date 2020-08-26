import { GraphbackPluginEngine } from "@graphback/core";
import { OffixDataStorePlugin } from "./OffixDataStorePlugin";
import { loadSchema } from "./utils";

export const generate = (schemaPath: string, outputPath: string) => {
    const schema = loadSchema(schemaPath);
    const pluginEngine = new GraphbackPluginEngine({
        schema,
        plugins: [
            new OffixDataStorePlugin({ modelOutputDir: outputPath })
        ]
    });
    pluginEngine.createResources();
};
