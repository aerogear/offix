export const networkStatus = {
  isOffline() {
    return Promise.resolve(false);
  },
  onStatusChangeListener() {
    return;
  }
};
