import { SecurityCheck, SecurityCheckResult } from "../src";

export class MockCheck implements SecurityCheck {
  public name = "Mock check";

  constructor(readonly shouldPass: bool) {}

  public test(): Promise<SecurityCheckResult> {
    return new Promise((resolve, reject) => {
      const checkResult: SecurityCheckResult = { name: this.name, passed: this.shouldPass };
      resolve(checkResult);
    });
  }
}
