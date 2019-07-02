import { createClient, OfflineClient } from "../src";
import { should } from "chai";
import { mock } from "fetch-mock";
import { storage } from "./mock/Storage";
import { networkStatus } from "./mock/NetworkState";
import { CompositeQueueListener } from "../src/offline/events/CompositeQueueListener";
import { getObjectFromCache } from "../src/utils/cacheHelper";
import { op } from "./mock/operations";

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

  it("Apply listener", async () => {
    const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
    const initClient = await client.init();
    initClient.registerOfflineEventListener(
      new CompositeQueueListener({ queueListeners: [] }));
  });

  // it("check direct cache read", async () => {
  //   const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
  //   const initClient = await client.init();
  //   initClient.restore({
  //     "test:1": {
  //       __typename: "test",
  //       value: 1
  //     }
  //   });
  //   const cacheObj = getObjectFromCache(op, "test");
  //   should().equal(cacheObj.value, 1);
  // });
});
