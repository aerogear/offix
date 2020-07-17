import { CRUDStorage } from "./CRUDStorage";

/**
 * This interface defines the API that is required
 * from any device specific storage implementation.
 * It defines a CRUD interface that a
 * device specific implementation must support.
*/
export interface StorageAdapter extends CRUDStorage {
  createTransaction(): Promise<Transaction>;  
}

export interface Transaction extends CRUDStorage {
  commit(): void;
  rollback(): void;
}
