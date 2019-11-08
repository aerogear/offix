import "fake-indexeddb/auto";

import { Offix } from "../src/Offix";
import { OffixExecutor } from "../src/Offix";
import { ToggleableNetworkStatus } from "./mock/ToggleableNetworkStatus";

import fetch from "node-fetch";
import { server } from "./utils/restServer";
import { Server } from "http";

let app: Server;

beforeAll(() => {
  app = server.listen(5000, () => {
    // no op
  });
});

afterAll(() => {
  app.close();
});

// This is a really trivial example how how you might use Offix with HTTP
// However there are still lots of things to figure out (such as error handling)
// Example: fetch does not throw errors for 3xx - 5xx Status Codes
// You'd have to implement that behaviour to work nicely with Offix
class FetchExecutor implements OffixExecutor {
  public baseUrl: string;
  public defaultOptions: RequestInit;

  // Just an example of how an executor could hold some of its own state/config
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" }
    };
  }

  public async execute(options: any) {
    const { path, fetchOptions } = options;

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...this.defaultOptions,
      ...fetchOptions
    });

    return res.json();
  }
}

test("Offix using a HTTP based Executor (online happy path)", async () => {

  const offix = new Offix({
    executor: new FetchExecutor("http://localhost:5000")
  });

  await offix.init();

  const task = { title: "new task", description: "this was created by offix"};

  const result = await offix.execute({
    path: "/tasks",
    fetchOptions: {
      body: JSON.stringify(task)
    }
  });

  expect(result.title).toBe(task.title);
  expect(result.description).toBe(task.description);
});

test("Offix using a HTTP based Executor (offline happy path)", async () => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(false);

  const offix = new Offix({
    networkStatus,
    executor: new FetchExecutor("http://localhost:5000")
  });

  await offix.init();

  const task = { title: "new task", description: "this was created by offix"};

  try {
    await offix.execute({
      path: "/tasks",
      fetchOptions: {
        body: JSON.stringify(task)
      }
    });
  } catch (err) {
    expect(err.offline).toBeTruthy();

    networkStatus.setOnline(true);

    const result = await err.watchOfflineChange();
    expect(result.title).toBe(task.title);
    expect(result.description).toBe(task.description);
  }
});
