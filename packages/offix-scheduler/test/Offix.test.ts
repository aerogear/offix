import "fake-indexeddb/auto";

import { OffixScheduler } from "../src/OffixScheduler";
import { OffixSchedulerExecutor } from "../src/OffixSchedulerExecutor";
import { WebNetworkStatus, CordovaNetworkStatus } from "offix-offline";
import { ToggleableNetworkStatus } from "./mock/ToggleableNetworkStatus";

test("Offix allows nothing passed at all", async () => {
  const offix = new OffixScheduler();
  await offix.init();
  expect(offix).toBeDefined();
});

test("Offix uses WebNetworkStatus by default", async () => {
  const offix = new OffixScheduler();
  expect(offix.networkStatus instanceof WebNetworkStatus).toBeTruthy();
});

test("Offix uses CrodovaNetworkStatus when window.cordova is defined", async () => {
  // @ts-ignore
  window.cordova = { "some": "oject" };
  const offix = new OffixScheduler();
  expect(offix.networkStatus instanceof CordovaNetworkStatus).toBeTruthy();
  // @ts-ignore
  delete window.cordova;
});

test("Offix allows executor to be passed", async () => {
  class MockExecutor implements OffixSchedulerExecutor {
    public async execute(options: any) {
      const foo = options.foo;
      return `hello ${foo}`;
    }
  }
  const offix = new OffixScheduler({
    executor: new MockExecutor()
  });

  await offix.init();

  const result = await offix.execute({ foo: "world" });

  expect(result).toBe("hello world");
});

test("Offix.execute returns an error when network status is offline", async () => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(false);
  class MockExecutor implements OffixSchedulerExecutor {
    public async execute(options: any) {
      const foo = options.foo;
      return `hello ${foo}`;
    }
  }

  const offix = new OffixScheduler({
    executor: new MockExecutor(),
    networkStatus
  });

  await offix.init();

  try {
    await offix.execute({ foo: "world" });
  } catch (err) {
    expect(err.offline).toBeTruthy();
    networkStatus.setOnline(true);
    const result = await err.watchOfflineChange();
    expect(result).toBe("hello world");
  }
});
