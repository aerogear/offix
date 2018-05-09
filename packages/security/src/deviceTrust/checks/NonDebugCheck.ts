import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare let cordova: any;

/**
 * A check for whether a device is running in debug mode
 */
export class NonDebugCheck implements SecurityCheck {
    public readonly name = "Is Debugger Check";

    public check(): Promise<SecurityCheckResult> {
        return new Promise((resolve, reject) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.IsDebug) {
                reject(new Error("Could not find plugin isDebug."));
                return;
            }

            cordova.plugins.IsDebug.getIsDebug((passed: boolean) => {
                const result: SecurityCheckResult = {name: this.name, passed: !passed};
                return resolve(result);
            }, (error: string) => reject(error));
        });
    }
}
