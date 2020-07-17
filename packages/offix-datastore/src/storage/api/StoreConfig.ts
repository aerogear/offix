/**
 * Config required to create a new store
 */
export interface IStoreConfig {
    /**
     * The name of the store
     */
    name: string;

    /**
     * The primary key
     */
    keyPath?: string;

    // TODO other indices
}
