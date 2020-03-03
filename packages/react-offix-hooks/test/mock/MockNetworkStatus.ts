export class MockNetworkStatus {
  public online: boolean;
  public callbacks: any[];

  constructor() {
    this.online = true;
    this.callbacks = [];
  }

  public addListener(callback: any) {
    this.callbacks.push(callback);
  }

  public removeListener(callback: any) {
    const index = this.callbacks.indexOf(callback);
    if (index >= 0) {
      this.callbacks.splice(index, 1);
    }
  }

  public isOffline(): Promise<boolean> {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  public setOnline(online: boolean) {
    this.online = online;
    for (const callback of this.callbacks) {
      callback({ online });
    }
  }
}
