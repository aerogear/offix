import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare var IRoot: any;

export class RootedCheck implements SecurityCheck {
  public readonly name = "Rooted Check";

  public test(): Promise<SecurityCheckResult> {
    return new Promise((resolve, reject) => {
      if (!IRoot) {
        reject(new Error("Could not find plugin IRoot."));
        return;
      }

      IRoot.isRooted((rooted: number) => {
        const result = new SecurityCheckResult(this.name, !!rooted);
        return resolve(result);
      }, (error: string) => reject(error));
    });
  }
}
