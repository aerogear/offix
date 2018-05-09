/**
 * Interface for the results of a single pass/fail security check.
 */
export interface SecurityCheckResult {
  /**
   * The name of the check. This can be used for reporting the check results.
   */
  name: string;

  /**
   * Whether the check passed or failed. A successful check means that the environment this
   * application is running in is more secure than otherwise, as opposed to signalling if a
   * certain feature was enabled
   *
   * For example, a check for whether the device is Rooted should return true when it
   * is *not* rooted, since this would be the more secure condition.
   */
  passed: boolean;
}
