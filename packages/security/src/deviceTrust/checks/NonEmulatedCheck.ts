import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare var device: any;

export class NonEmulatedCheck implements SecurityCheck {
  public readonly name = "Emulator Check";

  public check(): Promise<SecurityCheckResult> {
    return new Promise((resolve, reject) => {
      if (!device) {
        reject(new Error("Could not find plugin device."));
        return;
      }
      const result: SecurityCheckResult = { name: this.name, passed: !device.isVirtual };
      return resolve(result);
    });
  }
}
