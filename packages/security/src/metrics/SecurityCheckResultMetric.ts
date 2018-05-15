/**
 * Interface for the metric representation of a security check result.
 */
export interface SecurityCheckResultMetric {
  /**
   * ID of the check.
   */
  id: string;

  /**
   * Name of the check.
   */
  name: string;

  /**
   * Whether the check was successful or not.
   */
  passed: boolean;
}
