import { IOffixDataSyncPluginConfig } from "./OffixDataSyncConfig";


export const validateOffixDataSyncPluginConfig = (config?: IOffixDataSyncPluginConfig) => {
    if (!config) {
        throw new Error("Please supply Datasync-client plugin config");
    }
    if (!config?.modelOutputDir) {
        throw new Error("Datasync-client plugin requires modelOutputDir parameter");
    }
};
