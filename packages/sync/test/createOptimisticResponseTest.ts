import { createOptimisticResponse } from "../src";
import { expect } from "chai";
import { should } from "chai";

describe("Optimistic Response tests", () => {

  it("check createNewOptimisticResponse", () => {
    const result = createOptimisticResponse("updateTest", "Test", { name: "test" });
    expect(result.updateTest.__typename).eq("Test");
    expect(result.updateTest.name).eq("test");
  });

  it("check createNewOptimisticResponse without id", () => {
    const result = createOptimisticResponse("updateTest", "Test", { name: "test" }, false);
    expect(result.updateTest.__typename).eq("Test");
    expect(result.updateTest.name).eq("test");
    should().not.exist(result.updateTest.id);
  });
});
