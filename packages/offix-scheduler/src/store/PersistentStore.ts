
/**
 * Interface for underlying storage for cache and offline data
 */
export interface PersistentStore<T> {
  getItem: (key: string) => Promise<T>;
  setItem: (key: string, data: T) => Promise<void>;
  removeItem: (key: string) => Promise<void> | void;
}

/// leave type as object only

export type PersistedData = string | null | object;
