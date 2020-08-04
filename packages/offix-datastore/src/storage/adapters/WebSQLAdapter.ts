import invariant from "tiny-invariant";
import { StorageAdapter } from "../api/StorageAdapter";
import { PredicateFunction, ModelFieldPredicate } from "../../predicates";
// import { generateId } from "../LocalStorage";
import { createLogger } from "../../utils/logger";
import { ModelSchema } from "../../ModelSchema";
import websql from "websql";

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
    this.sqlite = websql.openDatabase(dbName, schemaVersion.toString(), "Offix datastore", 5 * 1024 * 1024);
    this.dbName = dbName;
    this.schemaVersion = schemaVersion;
  }
  // TODO Wrong architecture. Store can be created on demand
  // @ts-ignore
  public addStore(config: ModelSchema) {
    this.stores.push(config);
  }

  public async createStores() {
    // eslint-disable-next-line
    this.sqlite.transaction(async (tx: SQLTransaction) => {
      const existingStoreNames = await this.getStoreNames(tx);
      existingStoreNames.forEach((storeName) => {
        const existingModelStoreName = this.stores.find(((store) => (storeName === store.getStoreName())));
        if (existingModelStoreName) { return; }
        tx.executeSql("DROP TABLE ?", [existingModelStoreName], () => {
          logger("Store deleted", existingModelStoreName);
        }, errorCallback);
      });

      this.stores.forEach((store) => {
        if (existingStoreNames.includes(store.getName())) { return; }
        // TODO hardcoded id and unused keypath
        const stmt = this.getCreateStatement(store);
        tx.executeSql(stmt, [], () => logger("Store created", store), errorCallback);
      });
    });
  }

  public async save(storeName: string, input: any) {
    this.sqlite.transaction((tx) => {
      const cols = Object.keys(input).join(",");
      const bindings = Object.keys(input).map(() => "?").join(",");
      const vals = Object.values(input);
      const stmt = `INSERT INTO ${storeName} (${cols}) VALUES (${bindings})`;
      tx.executeSql(stmt, [...vals], () => {
        logger("Item added to store", storeName, vals);
      }, errorCallback);
    });
  }

  public async query(storeName: string, predicate?: PredicateFunction) {
    if (!predicate) {
      return await this.getStore(storeName);
    }
    const query = predicateToSQL(storeName, predicate as ModelFieldPredicate);
    // @ts-ignore
    const res = await this.readTransaction(query, [predicate.value]);
    return res;
  }

  // @ts-ignore
  public async update(storeName: string, input: any, predicate?: PredicateFunction) {
    // const targets = await this.query(storeName, predicate);
    // const store = await this.getStore(storeName);

    // const promises = targets.map((data) => this.convertToPromise<IDBValidKey>(
    //   store.put({ ...data, ...input }))
    // );
    // await Promise.all(promises);
    // // TODO redundant query to the DB.
    // return this.query(storeName, predicate);
  }

  // @ts-ignore
  public async remove(storeName: string, predicate?: PredicateFunction) {
    // const store = await this.getStore(storeName);
    // // TODO provide ability to delete from store by key (not fetching entire store which is innefficient)
    // // detect if predicate is id or create separate method
    // const all = await this.convertToPromise<any[]>(store.getAll());
    // let targets = all;
    // if (predicate) {
    //   targets = predicate.filter(all);
    // }
    // await Promise.all(
    //   targets.map((t) => this.convertToPromise(store.delete(t.id)))
    // );
    // return targets;
  }

  public getSQLiteInstance() {
    return this.sqlite;
  }

  private async getStore(storeName: string) {
    return this.readTransaction(`SELECT * FROM ${storeName}`, []);
  }

  private getStoreNames(transaction: SQLTransaction): Promise<string[]> {
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
        transaction.executeSql("SELECT name FROM sqlite_master WHERE name LIKE 'user_%'", [],
          successCb,
          errorCb
        );
      });
    });
  }

  private async transaction(query: string, args: any, read: false) {
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

const predicateToSQL = (storeName: string, predicate: ModelFieldPredicate) => {
  const key = predicate.getKey();
  const op = predicate.getOperator().op;
  const operator = (op === "eq") ? "=" : undefined;
  invariant(operator, "Operator not supported");
  return `SELECT * FROM ${storeName} WHERE ${key} ${operator} ?`;
};

const getType = (type: string): string => {
  const types: Record<string, string> = {
    "number": "INTEGER",
    "string": "TEXT",
    "boolean": "INTEGER"
  };
  return types[type] as string;
};
