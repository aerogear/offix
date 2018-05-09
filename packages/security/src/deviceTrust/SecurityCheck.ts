import { SecurityCheckResult } from "./SecurityCheckResult";

/**
 * Interface for a device security single security check that can be executed.
 */
export interface SecurityCheck {
  /**
   * The name of the check. This can be used for reporting the checks results.
   */
  name: string;

  /**
   * Execute the security check.
   *
   * @returns The result of the check.
   */
  check(): Promise<SecurityCheckResult>;
}
