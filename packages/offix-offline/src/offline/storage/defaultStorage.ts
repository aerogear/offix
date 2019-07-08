import { Store } from "idb-localstorage";

export const createDefaultOfflineStorage = () => {
  return new Store("offline-store", "offline-data");
};
