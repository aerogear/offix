import { removeListener } from "cluster";

export const networkStatus = {
  isOffline() {
    return Promise.resolve(false);
  },
  addListener() {
    return;
  },
  removeListener() {
    return;
  }
};
