import { createOptimisticResponse } from "../src/helpers/createOptimisticResponse";
import { expect } from "chai";

describe("SquashOperations", () => {

  it("check createNewOptimisticResponse", () => {
    const result = createOptimisticResponse("updateTest", "Test", { name: "test" });
    expect(result.updateTest.__typename).eq("Test");
    expect(result.updateTest.name).eq("test");
  });
});
