export class TestStore {
  constructor() {
    this.data = {};
  }

  getItem(key) {
    return this.data[key];
  }

  setItem(key, data) {
    this.data[key] = data;
  }

  removeItem(key) {
    delete this.data[key];
  }
}
