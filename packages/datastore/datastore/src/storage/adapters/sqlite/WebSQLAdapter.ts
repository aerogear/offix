import { AbstractSQLAdapter } from "./AbstractSQLAdapter";
import { StorageAdapter } from "../../api/StorageAdapter";


/**
 * Web Storage Implementation for DataStore using IndexedDB
 */
export class WebSQLAdapter extends AbstractSQLAdapter implements StorageAdapter {
  constructor(dbName: string, schemaVersion: number) {
    super(window.openDatabase(
      dbName,
      schemaVersion.toString(),
      "Offix datastore", 5 * 1024 * 1024
    ));
  }

  public async saveOrUpdate(storeName: string, idField: string, input: any) {
    const store = await this.queryById(storeName, idField, input[idField]);
    if (!store.length) {
      return this.save(storeName, input);
    }
    return this.update(storeName, input, { [idField]: input[idField] });
  }

}
