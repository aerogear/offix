const onLineGetter = window.navigator.__lookupGetter__("onLine");

export const goOffLine = () => {
  window.navigator.__defineGetter__("onLine", () => false);
};

export const goOnLine = () => {
  window.navigator.__defineGetter__("onLine", onLineGetter);
};

export class ToggleableNetworkStatus {
	public online: any;
	public callbacks: any;

  constructor() {
    this.online = true;
    this.callbacks = [];
  }

  public onStatusChangeListener(callback) {
    this.callbacks.push(callback);
  }

  public isOffline() {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  public setOnline(online) {
    this.online = online;
    for (const callback of this.callbacks) {
      callback.onStatusChange({ online });
    }
  }
}
