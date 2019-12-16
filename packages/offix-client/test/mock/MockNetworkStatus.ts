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
