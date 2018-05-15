import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare var IRoot: any;
declare var document: any;

/**
 * Check to detect whether a device is rooted (Android) or jailbroken (iOS).
 */
export class NonRootedCheck implements SecurityCheck {
  /**
   * Get the name of the check.
   */
  get name(): string {
    return "Rooted Check";
  }

  /**
   * Determine whether the device is rooted (Android) or jailbroken (iOS).
   * If the device is *not* rooted/jailbroken then the check will pass.
   *
   * @returns The result of the check.
   */
  public check(): Promise<SecurityCheckResult> {
    return new Promise((resolve, reject) => {
      if (!document) {
        reject(new Error("Cordova not fully loaded"));
      }

      document.addEventListener("deviceready", () => {
        if (!IRoot) {
          reject(new Error("Could not find plugin IRoot."));
          return;
        }

        IRoot.isRooted((rooted: number) => {
          const result: SecurityCheckResult = { name: this.name, passed: !rooted };
          return resolve(result);
        }, (error: string) => reject(error));
      }, false);
    });
  }
}
