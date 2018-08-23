import { DeviceCheck } from "../DeviceCheck";
import { DeviceCheckResult } from "../DeviceCheckResult";

declare let cordova: any;
declare var document: any;

/**
 * A check for whether a device is running in debug mode
 */
export class DebuggerEnabledCheck implements DeviceCheck {
    /**
     * Get the name of the check.
     */
    get name(): string {
        return "Debugger Check";
    }
    public check(): Promise<DeviceCheckResult> {
        return new Promise((resolve, reject) => {
            if (!document) {
                reject(new Error("Cordova not fully loaded"));
            }

            document.addEventListener("deviceready", () => {
                if (!cordova || !cordova.plugins || !cordova.plugins.IsDebug) {
                    reject(new Error("Could not find plugin isDebug."));
                    return;
                }

                cordova.plugins.IsDebug.getIsDebug((passed: boolean) => {
                    const result: DeviceCheckResult = { name: this.name, passed };
                    return resolve(result);
                }, (error: string) => reject(error));
            }, false);
        });
    }
}
