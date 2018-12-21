import {assert} from "chai";
import {MetricsBuilder} from "../../src/metrics";

global.window = {};

window.device = {};
window.cordova = {

  getAppVersion: {
    getPackageName: () => {
      console.info("");
    },
    getVersionNumber: () => {
      console.info("");
    }
  }
};

const storage: any = { "aerogear_metrics_client_key": "" };

const localStorage = {
  getItem: (key: string): any => {
    return storage[key];
  },
  setItem: (key: string, value: any): void => {
    storage[key] = value;
  }
};

describe("MetricsBuilder", () => {
  let metricsBuilder: MetricsBuilder;

  beforeEach(() => {
    metricsBuilder = new MetricsBuilder(localStorage);
    storage.aerogear_metrics_client_key = "";
  });

  describe("#getClientId", () => {

    it("should generate a string client id", () => {
      const id = metricsBuilder.getClientId();

      assert.isString(id);
    });

    it("should save the client id when getting for first time", () => {
      assert.equal(storage.aerogear_metrics_client_key, "");
      const id = metricsBuilder.getClientId();

      assert.equal(storage.aerogear_metrics_client_key, id);
    });

    it("should generate a new unique clientID if none is saved", () => {
      const id = metricsBuilder.getClientId();
      // Remove id from storage, as if it was a different device
      storage.aerogear_metrics_client_key = "";
      const newId = metricsBuilder.getClientId();

      assert.notEqual(id, newId);
    });

    it("should return the same clientID after the first time", () => {
      const id = metricsBuilder.getClientId();
      const newId = metricsBuilder.getClientId();

      assert.equal(id, newId);
    });

  });

});
