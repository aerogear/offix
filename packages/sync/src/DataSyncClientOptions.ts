import { PersistedData, PersistentStore } from "./PersistentStore";

declare var window: any;

/**
 * Contains all options required to initialize SDK
 * @see DefaultOptions for defaults
 */
export interface DataSyncClientOptions {

  /**
   * Describes name of the field used as ID
   */
  objectIdField?: string;

  /**
   * Storage solution
   */
  storage?: PersistentStore<PersistedData>;
}

export class DefaultDataSyncClientOptions implements DataSyncClientOptions {
  // Explicitly use id as id field :)
  public defaultObjectIdField = "id";
  // Use browser storage by default
  public storage = window.localStorage;

  public merge(clientOptions?: DataSyncClientOptions): DataSyncClientOptions {
    return Object.assign({}, this, clientOptions);
  }
}
