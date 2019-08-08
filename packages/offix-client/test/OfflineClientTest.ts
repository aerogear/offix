import { createClient, OfflineClient } from "../src";
import { should, assert } from "chai";
import { mock } from "fetch-mock";
import { storage } from "./mock/Storage";
import { networkStatus } from "./mock/NetworkState";
import { CompositeQueueListener } from "offix-offline";
import { HttpLink } from "apollo-link-http";

const url = "http://test";

describe("Top level api tests", () => {
  before(() => {
    mock(url, 200);
  });
  it("check old api", async () => {
    const client = await createClient({
      httpUrl: url, storage, networkStatus
    });
    should().exist(client);
  });

  it("check new api", async () => {
    const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
    const initClient = await client.init();
    should().exist(client.apolloClient);
    should().exist(initClient.offlineStore);
    should().exist(client.registerOfflineEventListener);
  });

  it("Pass link directly", async () => {
    const terminatingLink = new HttpLink({ uri: url });
    const client = new OfflineClient({ terminatingLink, storage, networkStatus });
    await client.init();
    should().exist(client.apolloClient);
  });

  it("Pass invalid config directly", async () => {
    const client = new OfflineClient({ storage, networkStatus });
    client.init().then(() => {
      assert.fail();
    }).catch((err) => {
      assert.ok(err);
    });
  });

  it("apolloClient should be available after init", async () => {
    const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
    await client.init();
    should().exist(client.apolloClient);
  });

  it("Apply listener", async () => {
    const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
    const initClient = await client.init();
    initClient.registerOfflineEventListener(
      new CompositeQueueListener({ queueListeners: [] }));
  });

});
