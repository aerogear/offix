import { OffixScheduler } from "../src/OffixScheduler";
import { OffixSchedulerExecutor } from "../src/OffixSchedulerExecutor";
import { ToggleableNetworkStatus } from "./mock/ToggleableNetworkStatus";

// eslint-disable-next-line
console.error = jest.fn();

test("Offix can be initialized with no store creates console error", async () => {
  const offix = new OffixScheduler();
  await offix.init();
  // eslint-disable-next-line
  expect(console.error).toHaveBeenCalled();
});

test("Offix can be initialized with no store", async () => {
  const offix = new OffixScheduler();
  await offix.init();
  expect(offix.offlineStore.initialized).toBeFalsy();
});

test("Offix.execute returns an error when network status is offline and without offline storage", async () => {
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
