import { SecurityCheck } from "../SecurityCheck";
import { SecurityCheckResult } from "../SecurityCheckResult";

declare let cordova: any;

export class DebuggerCheck implements SecurityCheck {
    public readonly name = "Is Debugger Check";

    public check(): Promise<SecurityCheckResult> {
        return new Promise((resolve, reject) => {
            if (!cordova.plugins.isDebug) {
                reject(new Error("Could not find plugin isDebug."));
                return;
            }

            cordova.plugins.isDebug((passed: boolean) => {
                const result: SecurityCheckResult = {name: this.name, passed};
                return resolve(result);
            }, (error: string) => reject(error));
        });
    }
}
