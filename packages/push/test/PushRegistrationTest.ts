import { assert, expect } from "chai";
import mocha from "mocha";
import { PushRegistration } from "../src/PushRegistration";
import { ConfigurationService } from "@aerogear/core";

global.window = { btoa: () => "dGVzdA==" };
window.device = { platform: "iOS" };

describe("Registration tests", () => {
  const pushConfig = {
    "version": 1,
    "clusterName": "192.168.64.74:8443",
    "namespace": "myproject",
    "clientId": "example_client_id",
    services: [{
      "id": "push",
      "name": "push",
      "type": "push",
      "url": "http://www.mocky.io/v2/5a5e4bc53300003b291923eb",
      "config": {
        "ios": {
          "variantId": "f85015b4-a762-49a7-a36f-34a451f819a4",
          "variantSecret": "978b35d6-7058-43b4-8c37-4dc30022ebda"
        }
      }
    }]
  };
  const config = new ConfigurationService(pushConfig);
  const registration = new PushRegistration(config);

  describe("#register", async () => {
    it("should fail to register in push server", async () => {
      registration.register(undefined, "cordova", ["Test"]).then(() => {
        assert.fail();
      }).catch(() => {
        return "ok";
      });
    });

    it("should register in push server", async () => {
      return registration.register("token", "cordova", ["Test"]).catch((error) => {
        assert.fail(error);
      });
    });
  });
});
