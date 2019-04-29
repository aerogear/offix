import { createClient, OfflineClient } from "../src";
import { expect, should } from "chai";
import { mock } from "fetch-mock";
import { storage } from "./mock/Storage";
import { networkStatus } from "./mock/NetworkState";

const url = "http://test";

describe("Top level api tests", () => {
  before(() => {
    mock(url, 200);
  });
  it("check old api", async () => {
    const client = await createClient({
      httpUrl: url, storage, networkStatus});
    should().exist(client.offlineStore);
  });

  it("check new api", async () => {
    const client = new OfflineClient({ httpUrl: url, storage, networkStatus });
    const initClient = await client.init();
    should().exist(initClient.offlineStore);
  });
});
