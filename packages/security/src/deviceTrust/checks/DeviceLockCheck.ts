import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare var cordova: any;
declare var document: any;

/**
 * Security check to detect if a device has a screen lock set or not.
 */
export class DeviceLockCheck implements SecurityCheck {
  /**
   * Get the name of the check.
   */
  get name(): string {
    return "Device Lock Check";
  }

  /**
   * Determine whether a device has a screen lock set or not.
   * If the device *has* a screen lock set then the check
   * will pass.
   *
   * @returns The result of the check.
   */
  public check(): Promise<SecurityCheckResult> {
    return new Promise((resolve, reject) => {
      if (!document) {
        reject(new Error("Cordova not fully loaded"));
      }

      document.addEventListener("deviceready", () => {
        if (!cordova || !cordova.plugins || !cordova.plugins.PinCheck) {
          reject(new Error("Could not find plugin PinCheck"));
        }

        cordova.plugins.PinCheck.isPinSetup((pinIsSet: string) => {
          const result: SecurityCheckResult = { name: this.name, passed: !!pinIsSet };
          return resolve(result);
        }, (error: Error) => {
          if (error.toString() === "NO_PIN_SETUP") {
            const result: SecurityCheckResult = { name: this.name, passed: !error };
            return resolve(result);
          } else {
            return reject(error);
          }
        });
      }, false);
    });
  }
}
