import { IOffixDataStorePluginConfig } from "./OffixDataStoreConfig";


export const validateOffixDataStorePluginConfig = (config?: IOffixDataStorePluginConfig) => {
    if (!config) {
        throw new Error("Please supply Datasync-client plugin config");
    }
    if (!config?.modelOutputDir) {
        throw new Error("Datasync-client plugin requires modelOutputDir parameter");
    }
};
