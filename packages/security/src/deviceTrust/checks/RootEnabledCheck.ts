import { isCordovaAndroid } from "@aerogear/core";
import { DeviceCheck } from "../DeviceCheck";
import { DeviceCheckResult } from "../DeviceCheckResult";

declare var IRoot: any;
declare var document: any;

/**
 * Check to detect whether a device is rooted (Android) or jailbroken (iOS).
 */
export class RootEnabledCheck implements DeviceCheck {
  /**
   * Get the name of the check.
   */
  get name(): string {
    return "Rooted Check";
  }

  /**
   * Determine whether the device is rooted (Android) or jailbroken (iOS).
   * If the device is rooted/jailbroken then the check will pass.
   *
   * @returns The result of the check.
   */
  public check(): Promise<DeviceCheckResult> {
    return new Promise((resolve, reject) => {
      if (!document) {
        reject(new Error("Cordova not fully loaded"));
      }

      document.addEventListener("deviceready", () => {
        if (!IRoot) {
          reject(new Error("Could not find plugin IRoot"));
          return;
        }
        const isRootedCheck = isCordovaAndroid() ? IRoot.isRootedRedBeer : IRoot.isRooted;
        isRootedCheck((rooted: number) => {
          const result: DeviceCheckResult = { name: this.name, passed: !!rooted };
          return resolve(result);
        }, (error: string) => reject(error));
      }, false);
    });
  }
}
