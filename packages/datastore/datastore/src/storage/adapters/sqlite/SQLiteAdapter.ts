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
      5 * 1024 * 1024
    ));
  }
}
