/**
 * Config for OffixDataSync plugin
 */
export interface IOffixDataSyncPluginConfig {
    /**
     * The output dir path.
     * The json schema will be written to ${outputDir}/schema.json
     * The datasync config will be written to ${outputDir}/config.ts
     */
    outputDir?: string;
}
