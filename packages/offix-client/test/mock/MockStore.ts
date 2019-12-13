export class MockStore {
  public data: any;
  constructor() {
    this.data = {};
  }

  public getItem(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(this.data[key]);
    });
  }

  public setItem(key: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.data[key] = data;
      resolve();
    });
  }

  public removeItem(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      delete this.data[key];
      resolve();
    });
  }
}
