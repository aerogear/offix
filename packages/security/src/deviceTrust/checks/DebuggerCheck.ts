import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare let cordova: any;

/**
 * A check for whether a debugger is attached to the current application
 */
export class DebuggerCheck implements SecurityCheck {
    public readonly name = "Is Debugger Check";

    /**
     * An application running with an attached debugger can have its internals exposed.
     */
    public check(): Promise<SecurityCheckResult> {
        return new Promise((resolve, reject) => {
            if (!cordova.plugins.IsDebug) {
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
