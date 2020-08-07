import invariant from "tiny-invariant";
import { StorageAdapter } from "../api/StorageAdapter";
import { PredicateFunction, ModelFieldPredicate } from "../../predicates";
import { generateId } from "../LocalStorage";
import { createLogger } from "../../utils/logger";
import { ModelSchema } from "../../ModelSchema";

const logger = createLogger("sqlite");

/**
 * Web Storage Implementation for DataStore using IndexedDB
 */
export class WebSQLAdapter implements StorageAdapter {
  private sqlite: Database;
  private stores: ModelSchema[] = [];
  private dbName: string;
  private schemaVersion: number;

  constructor(dbName: string, schemaVersion: number) {
    this.dbName = dbName;
    this.schemaVersion = schemaVersion;
    invariant("openDatabase" in window, "websql not supported");
    this.sqlite = window.openDatabase(
      dbName,
      schemaVersion.toString(),
      "Offix datastore", 5 * 1024 * 1024
    );
  }

  public addStore(config: ModelSchema) {
    this.stores.push(config);
  }

  public async createStores() {
    const existingStoreNames = await this.getStoreNames();
    for await (const storeName of existingStoreNames) {
      const existingModelStoreName = this.stores.find(((store) => (storeName === store.getName())));
      if (existingModelStoreName) { return; }
      await this.transaction("DROP TABLE ?", [existingModelStoreName]);
    }
    for await (const store of this.stores) {
      if (existingStoreNames.includes(store.getName())) { return; }
      const query = this.getCreateStatement(store);
      await this.transaction(query, []);
    }
  }

  public async save(storeName: string, input: any): Promise<any> {
    const [cols, vals] = prepareStatement(input, "insert");
    const query = `INSERT INTO ${storeName} ${cols}`;
    return this.transaction(query, vals);
  }

  public async query(storeName: string, predicate?: PredicateFunction): Promise<any> {
    if (!predicate) {
      return await this.fetchAll(storeName);
    }
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const query = `SELECT * FROM ${storeName} ${condition}`;
    // @ts-ignore
    const res = await this.readTransaction(query, [predicate.value]);
    return res;
  }

  public async update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any> {
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const [cols, vals] = prepareStatement(input, "update");
    const query = `UPDATE ${storeName} SET ${cols} ${condition}`;
    // @ts-ignore
    return this.transaction(query, [...vals, predicate.value]);
  }

  public async remove(storeName: string, predicate?: PredicateFunction): Promise<any> {
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const query = `DELETE FROM ${storeName} ${condition}`;
    // @ts-ignore
    return this.transaction(query, [predicate.value]);
  }

  public getSQLiteInstance() {
    return this.sqlite;
  }

  createTransaction(): Promise<StorageAdapter> {
    throw new Error("Method not implemented.");
  }
  commit(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  rollback(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  isTransactionOpen(): boolean {
    throw new Error("Method not implemented.");
  }

  private async fetchAll(storeName: string) {
    return this.readTransaction(`SELECT * FROM ${storeName}`, []);
  }

  private async getStoreNames(): Promise<string[]> {
    const res = await this.readTransaction(
      "SELECT name FROM sqlite_master WHERE name LIKE 'user_%'",
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
      this.sqlite.transaction((tx) => {
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
      this.sqlite.readTransaction((tx) => {
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
      this.sqlite.transaction((tx) => {
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

// TODO change to constants/enums
const prepareStatement = (input: any, type: string = "insert"): [string, any[]] => {
  if (type === "insert") {
    input.id = generateId();
    const cols = Object.keys(input).join(",");
    const bindings = Object.keys(input).map(() => "?").join(",");
    const vals = Object.values(input);
    const statement = `(${cols}) VALUES (${bindings})`;
    return [statement, vals];
  }
  if (type === "update") {
    const statement = Object.keys(input).map((k) => {
      return `${k} = ?`;
    }).join(",");
    const vals = Object.values(input);
    return [statement, vals];
  }
  invariant(false, "Unsupported query type");
};

const predicateToSQL = (predicate: ModelFieldPredicate) => {
  const key = predicate.getKey();
  const op = predicate.getOperator().op;
  const operator = (op === "eq") ? "=" : undefined;
  invariant(operator, "Operator not supported");
  return `WHERE ${key} ${operator} ?`;
};

const getType = (type: string): string => {
  const types: Record<string, string> = {
    "number": "INTEGER",
    "string": "TEXT",
    "boolean": "INTEGER"
  };
  return types[type] as string;
};

/**
 * Return the SQL result set as a flat array
 * instead of having to iterate over it at a later stage
 *
 * @param rows SQLResultSet
 */
const flattenResultSet = (rows: SQLResultSetRowList): any[] => {
  const result: any = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    result.push(row);
  }
  return result;
};
