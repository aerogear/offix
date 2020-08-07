import { IDBLocalStore } from "./IDBLocalStore";

export const createDefaultOfflineStorage = () => {
  return new IDBLocalStore("offline-store", "offline-data");
};
