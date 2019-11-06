import "fake-indexeddb/auto";

import { Offix } from "../src/Offix";
import { OffixExecutor } from "../types";

test("Offix allows nothing passed at all", async () => {
  // @ts-ignore
  const offix = new Offix();
  await offix.init();
  expect(offix).toBeDefined();
});

test("Offix allows executor to be passed", async () => {
  class MockExecutor implements OffixExecutor {
    public async execute(options: any) {
      const foo = options.foo;
      return `hello ${foo}`;
    }
  }
  // @ts-ignore
  const offix = new Offix({
    executor: new MockExecutor()
  });

  await offix.init();

  const result = await offix.execute({ foo: "world" });

  expect(result).toBe("hello world");
});
