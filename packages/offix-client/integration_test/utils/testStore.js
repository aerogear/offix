export class TestStore {
  constructor() {
    this.data = {};
  }

  getItem(key) {
    return Promise.resolve(this.data[key]);
  }

  setItem(key, data) {
    this.data[key] = data;
    return Promise.resolve();
  }

  removeItem(key) {
    delete this.data[key];
    return Promise.resolve();
  }
}
