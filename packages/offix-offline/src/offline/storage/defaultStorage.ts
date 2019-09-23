import { Store } from "idb-localstorage";

export const createDefaultOfflineStorage = () => {
  try {
    return new Store("offline-store", "offline-data");
  } catch (error) {
    console.error("failed to create offline storage", error);
  }
};
