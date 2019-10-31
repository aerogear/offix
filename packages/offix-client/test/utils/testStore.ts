export class TestStore {
  public data: any;

  constructor() {
    this.data = {};
  }

  public getItem(key) {
    return new Promise((resolve, reject) => {
      resolve(this.data[key]);
    });
  }

  public setItem(key, data) {
    return new Promise((resolve, reject) => {
      this.data[key] = data;
      resolve();
    });
  }

  public removeItem(key) {
    return new Promise((resolve, reject) => {
      delete this.data[key];
      resolve();
    });
  }
}
