const onLineGetter = window.navigator.__lookupGetter__('onLine');

export const goOffLine = () => {
  window.navigator.__defineGetter__('onLine', () => false);
};

export const goOnLine = () => {
  window.navigator.__defineGetter__('onLine', onLineGetter);
};

export class ToggleableNetworkStatus {
  constructor() {
    this.online = true;
  }

  onStatusChangeListener(callback) {
    this.callback = callback;
  }

  isOffline() {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  setOnline(online) {
    this.online = online;
    this.callback && this.callback.onStatusChange({ online });
  }
};
