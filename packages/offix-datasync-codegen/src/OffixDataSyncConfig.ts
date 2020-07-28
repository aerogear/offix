/**
 * Config for OffixDataSync plugin
 */
export interface IOffixDataSyncPluginConfig {
    /**
     * The output dir path.
     * The json schema will be written to ${modelOutputDir}/schema/
     * The datasync config will be written to ${modelOutputDir}/config.ts
     */
    modelOutputDir?: string;
}
