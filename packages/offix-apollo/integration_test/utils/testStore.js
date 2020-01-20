export class TestStore {
  constructor() {
    this.data = {};
  }

  getItem(key) {
    return new Promise((resolve, reject) => {
      resolve(this.data[key])
    })
  }

  setItem(key, data) {
    return new Promise((resolve, reject) => {
      this.data[key] = data;
      resolve()
    })
  }

  removeItem(key) {
    return new Promise((resolve, reject) => {
      delete this.data[key];
      resolve()
    })
  }
}
