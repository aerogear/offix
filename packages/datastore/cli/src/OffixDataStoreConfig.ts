/**
 * Config for OffixDataStore plugin
 */
export interface IOffixDataStorePluginConfig {
    /**
     * The output dir path.
     * The json schema will be written to ${modelOutputDir}/schema.json
     * Model types will be written to ${modelOutputDir}/types.ts
     */
    modelOutputDir?: string;
}
