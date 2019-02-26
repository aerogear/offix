import { DeviceCheck, DeviceCheckResult } from "../../src";

export class MockCheck implements DeviceCheck {
  public name = "Mock check";

  constructor(readonly shouldPass: boolean) {}

  public check(): Promise<DeviceCheckResult> {
    return new Promise((resolve, reject) => {
      const checkResult: DeviceCheckResult = { name: this.name, passed: this.shouldPass };
      resolve(checkResult);
    });
  }
}
