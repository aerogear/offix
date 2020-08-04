import invariant from "tiny-invariant";
import { StorageAdapter } from "../api/StorageAdapter";
import { PredicateFunction, ModelFieldPredicate } from "../../predicates";
// import { generateId } from "../LocalStorage";
import { createLogger } from "../../utils/logger";
import { ModelSchema } from "../../ModelSchema";
import "websql";

const logger = createLogger("sqlite");

const errorCallback = (tx: SQLTransaction, err: SQLError) => {
  logger("error", err);
  return false;
};

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
    invariant("openDatabase" in window, "WebSQL not supported");
    this.sqlite = window.openDatabase(
      dbName,
      schemaVersion.toString(),
      "Offix datastore", 5 * 1024 * 1024
    );
  }
  // TODO Wrong architecture. Store can be created on demand
  // @ts-ignore
  public addStore(config: ModelSchema) {
    this.stores.push(config);
  }

  public async createStores() {
    // eslint-disable-next-line
    this.sqlite.transaction(async (tx: SQLTransaction) => {
      const existingStoreNames = await this.getStoreNames();
      existingStoreNames.forEach((storeName) => {
        const existingModelStoreName = this.stores.find(((store) => (storeName === store.getStoreName())));
        if (existingModelStoreName) { return; }
        tx.executeSql("DROP TABLE ?", [existingModelStoreName], () => {
          logger("Store deleted", existingModelStoreName);
        }, errorCallback);
      });

      this.stores.forEach((store) => {
        if (existingStoreNames.includes(store.getName())) { return; }
        const stmt = this.getCreateStatement(store);
        tx.executeSql(stmt, [], () => logger("Store created", store), errorCallback);
      });
    });
  }

  public async save(storeName: string, input: any) {
    const [cols, vals] = prepareStatement(input, "insert");
    const stmt = `INSERT INTO ${storeName} ${cols}`;
    this.transaction(stmt, vals);
  }

  public async query(storeName: string, predicate?: PredicateFunction) {
    if (!predicate) {
      return await this.getStore(storeName);
    }
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const query = `SELECT * FROM ${storeName} ${condition}`;
    // @ts-ignore
    const res = await this.readTransaction(query, [predicate.value]);
    return res;
  }

  // @ts-ignore
  public async update(storeName: string, input: any, predicate?: PredicateFunction) {
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const [cols, vals] = prepareStatement(input, "update");
    const query = `UPDATE ${storeName} SET ${cols} ${condition}`;
    // @ts-ignore
    return this.transaction(query, [...vals, predicate.value]);
  }

  // @ts-ignore
  public async remove(storeName: string, predicate?: PredicateFunction) {
    const condition = predicateToSQL(predicate as ModelFieldPredicate);
    const query = `DELETE FROM ${storeName} ${condition}`;
    // @ts-ignore
    return this.transaction(query, [predicate.value]);
  }

  public getSQLiteInstance() {
    return this.sqlite;
  }

  private async getStore(storeName: string) {
    return this.readTransaction(`SELECT * FROM ${storeName}`, []);
  }

  private getStoreNames(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => {
        const l = res.rows.length - 1;
        const existingStores = [];
        for (let i = 0; i < l; i++) {
          const existingStore = res.rows.item(i);
          existingStores.push(existingStore.name);
        }
        resolve(existingStores);
      };
      const errorCb = (tx: SQLTransaction, err: SQLError) => {
        reject(err.message);
        return false;
      };
      this.sqlite.transaction((tx) => {
        tx.executeSql("SELECT name FROM sqlite_master WHERE name LIKE 'user_%'", [],
          successCb,
          errorCb
        );
      });
    });
  }

  private async transaction(query: string, args: any) {
    return new Promise((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => {
        logger("Executed query with results", res.rows);
        resolve(res.rows);
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

  private async readTransaction(query: string, args: any) {
    return new Promise((resolve, reject) => {
      const successCb = (tx: SQLTransaction, res: SQLResultSet) => {
        logger("Executed query with results", res.rows);
        resolve(res.rows);
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
