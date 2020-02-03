
// @ts-ignore
const onLineGetter = window.navigator.__lookupGetter__("onLine");

export const goOffLine = () => {
  // @ts-ignore
  window.navigator.__defineGetter__("onLine", () => false);
};

export const goOnLine = () => {
  // @ts-ignore
  window.navigator.__defineGetter__("onLine", onLineGetter);
};

export class MockNetworkStatus {
  public online: boolean;
  public callbacks: any[];

  constructor() {
    this.online = true;
    this.callbacks = [];
  }

  public onStatusChangeListener(callback: any) {
    this.callbacks.push(callback);
  }

  public isOffline(): Promise<boolean> {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  public setOnline(online: boolean) {
    this.online = online;
    for (const callback of this.callbacks) {
      callback.onStatusChange({ online });
    }
  }
}
