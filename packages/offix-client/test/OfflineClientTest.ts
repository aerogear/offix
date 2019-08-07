import { createClient, OfflineClient } from "../src";
import { should } from "chai";
import { mock } from "fetch-mock";
import { storage } from "./mock/Storage";
import { networkStatus } from "./mock/NetworkState";
import { CompositeQueueListener } from "offix-offline";

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
    should().exist(initClient.offlineStore);
    should().exist(client.registerOfflineEventListener);
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
