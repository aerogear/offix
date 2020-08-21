import { GraphbackPluginEngine } from "@graphback/core";
import { readFileSync } from "fs";
import { OffixDataSyncPlugin } from "./OffixDataSyncPlugin";

export const generate = (schemaPath: string, outputPath: string) => {
    const schema = readFileSync(schemaPath).toString();
    const pluginEngine = new GraphbackPluginEngine({
        schema,
        plugins: [
            new OffixDataSyncPlugin({ modelOutputDir: outputPath })
        ]
    });
    pluginEngine.createResources();
};
