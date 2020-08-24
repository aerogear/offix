// @ts-ignore
import SQLite from "react-native-sqlite-2";
import { StorageAdapter } from "../../api/StorageAdapter";
import { AbstractSQLAdapter } from "./AbstractSQLAdapter";

/**
 * Web Storage Implementation for DataStore using IndexedDB
 */
export class SQLiteAdapter extends AbstractSQLAdapter implements StorageAdapter {
  constructor(dbName: string, schemaVersion: number) {
    super(SQLite.openDatabase(
      dbName,
      schemaVersion.toString(),
      "Offix datastore",
      // @ts-ignore
      5 * 1024 * 1024
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
