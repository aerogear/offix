/**
 * Interface for the results of a single pass/fail security check.
 */
export interface DeviceCheckResult {
  /**
   * The name of the check. This can be used for reporting the check results.
   */
  name: string;

  /**
   * If the executed check completed with success or failure.
   */
  passed: boolean;
}
