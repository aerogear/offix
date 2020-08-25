import { StorageAdapter } from "../../api/StorageAdapter";
import { createLogger } from "../../../utils/logger";
import { ModelSchema } from "../../../ModelSchema";
import { Filter } from "../../../filters";
import { prepareStatement, flattenResultSet, getType, serializeData, deserializeData } from "./utils";
import { filterToSQL } from "./filterToSQL";

const logger = createLogger("sqlite");

/**
 * Web Storage Implementation for DataStore using IndexedDB
 */
export abstract class BaseSQLAdapter implements StorageAdapter {
  private sqlite: Database;
  private stores: ModelSchema[] = [];

  constructor(sqlite: Database) {
    this.sqlite = sqlite;
  }

  public addStore(config: ModelSchema) {
    this.stores.push(config);
  }

  public async createStores() {
    const existingStoreNames = await this.getStoreNames();
    for await (const storeName of existingStoreNames) {
      const existingModelStoreName = this.stores.find(((store) => (storeName === store.getName())));
      if (existingModelStoreName) { return; }
      await this.transaction(`DROP TABLE IF EXISTS ${existingModelStoreName}`, []);
    }
    for await (const store of this.stores) {
      if (existingStoreNames.includes(store.getName())) { return; }
      const query = this.getCreateStatement(store);
      await this.transaction(query, []);
    }
  }

  public async save(storeName: string, input: any): Promise<any> {
    const serialized = serializeData(input);
    const [cols, vals] = prepareStatement(serialized, "insert");
    const query = `INSERT INTO ${storeName} ${cols}`;
    await this.transaction(query, vals);
    return serialized;
  }

  public async query(storeName: string, filter?: Filter): Promise<any[]> {
    if (!filter) {
      const data = await this.fetchAll(storeName);
      return deserializeData(data);
    }
    const condition = filterToSQL(filter);
    const query = `SELECT * FROM ${storeName} ${condition}`;
    // @ts-ignore
    const res = await this.readTransaction(query, []);
    return deserializeData(res);
  }

  public async queryById(storeName: string, idField: string, id: string) {
    const escapedId = (typeof id === "string") ? `"${id}"` : id;
    const query = `SELECT * FROM ${storeName} WHERE ${idField} = ${escapedId}`;
    // @ts-ignore
    const res = await this.readTransaction(query, []);
    return deserializeData(res);
  }

  public async update(storeName: string, input: any, filter?: Filter): Promise<any> {
    const condition = filterToSQL(filter);
    const [cols, vals] = prepareStatement(serializeData(input), "update");
    const query = `UPDATE ${storeName} SET ${cols} ${condition}`;
    // @ts-ignore
    return this.transaction(query, [...vals]);
  }

  public async updateById(storeName: string, idField: string, input: any) {
    const [cols, vals] = prepareStatement(serializeData(input), "update");
    const id = input[idField];
    const escapedId = (typeof id === "string") ? `"${id}"` : id;
    const query = `UPDATE ${storeName} SET ${cols} ${idField} = ${escapedId}`;
    // @ts-ignore
    return this.transaction(query, [...vals]);
  }

  public async saveOrUpdate(storeName: string, idField: string, input: any) {
    const serializedInput = serializeData(input);
    const [cols, vals] = prepareStatement(serializedInput, "insert");
    const [updateCols] = prepareStatement(serializedInput, "update");
    const query = `INSERT INTO ${storeName} ${cols}`
      + ` ON CONFLICT(${idField}) DO UPDATE SET ${updateCols}`;
    // @ts-ignore
    return this.transaction(query, [...vals]);
  }

  public async remove(storeName: string, idField: string, filter?: Filter): Promise<any> {
    const condition = filterToSQL(filter);
    const query = `DELETE FROM ${storeName} ${condition}`;
    // @ts-ignore
    return this.transaction(query, []);
  }

  public async deleteStore(storeName: string): Promise<any> {
    const query = `DELETE FROM ${storeName}`;
    // @ts-ignore
    return this.transaction(query, []);
  }

  public async removeById(storeName: string, idField: string, id: string): Promise<any> {
    const escapedId = (typeof id === "string") ? `"${id}"` : id;
    const query = `DELETE FROM ${storeName} ${idField} ${escapedId}`;
    // @ts-ignore
    return this.transaction(query, []);
  }

  public getSQLiteInstance() {
    return this.sqlite;
  }

  createTransaction(): Promise<StorageAdapter> {
    return new Promise((resolve) => {
      resolve(this);
    });
  }
  commit(): Promise<void> {
    logger("[Commit] Method not implemented.");
    return Promise.resolve();
  }
  rollback(): Promise<void> {
    logger("[Rollback] Method not implemented.");
    return Promise.resolve();
  }

  isTransactionOpen(): boolean {
    throw new Error("[isOpen] Method not implemented.");
  }

  private async fetchAll(storeName: string) {
    return this.readTransaction(`SELECT * FROM ${storeName}`, []);
  }

  private async getStoreNames(): Promise<string[]> {
    const res = await this.readTransaction(
      "SELECT name FROM sqlite_master WHERE name NOT LIKE 'android_%' AND name NOT LIKE 'sqlite_%'",
      []
    );
    return res.map((r) => r.name);
  }

  private async transaction(query: string, args: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => {
        logger("Executed query with results", res.rows);
        resolve(flattenResultSet(res.rows));
      };
      const errorCb = (tx: SQLTransaction, error: SQLError) => {
        reject(error);
        return false;
      };
      this.sqlite.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          query,
          [...args],
          successCb,
          errorCb
        );
      });
    });
  }

  private async readTransaction(query: string, args: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => {
        logger("Executed query with results", res.rows);
        resolve(flattenResultSet(res.rows));
      };
      const errorCb = (tx: SQLTransaction, error: SQLError) => {
        reject(error);
        return false;
      };
      this.sqlite.readTransaction((tx: SQLTransaction) => {
        tx.executeSql(
          query,
          [...args],
          successCb,
          errorCb
        );
      });
    });
  }

  private getCreateStatement(store: ModelSchema): string {
    const fields = store.getFields();
    const query = Object.keys(fields).map((name) => {
      const field = fields[name];
      // TODO handle more complicated datatypes
      const type = getType(field.type as string);
      if (field.primary) {
        // Set primary key to string to match mongo
        // since SQLite uses rowId for unique integer id
        return `${name} TEXT PRIMARY KEY`;
      };
      return `${name} ${type}`;
    }).join(",");
    return `CREATE TABLE IF NOT EXISTS ${store.getStoreName()} (${query})`;
  }

  private convertToPromise<T>(statement: string, args: any[]) {
    return new Promise<T>((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => resolve(res.rows as unknown as T);
      const errorCb = (tx: SQLTransaction, err: SQLError) => {
        reject(err);
        return false;
      };
      this.sqlite.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          statement,
          args,
          successCb,
          errorCb
        );
      });
    });
  }
}
