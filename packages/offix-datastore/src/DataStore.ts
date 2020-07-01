import { Storage } from "./storage";
import { Model, Fields } from "./Model";

export class DataStore {
    private dbName: string;
    private schemaVersion: number;
    private storeNames: string[];
    private storage?: Storage;

    constructor(dbName: string, schemaVersion: number = 1) {
        this.dbName = dbName;
        this.schemaVersion = schemaVersion;
        this.storeNames = [];
    }

    public create<T>(name: string, storeName: string, fields: Fields<T>) {
        this.storeNames.push(storeName);
        return new Model<T>(name, storeName, fields, () => {
            if (this.storage) {return this.storage;}
            throw new Error("DataStore has not been initialised");
        });
    }

    public init() {
        this.storage = new Storage(this.dbName, this.storeNames, this.schemaVersion);
        // storage.storeChangeEventStream.subscribe(updateServer);
    }
}
