import { SecurityCheckResult } from "../deviceTrust";
import { SecurityCheckResultMetric } from "./SecurityCheckResultMetric";

/**
 * Collects metrics for security check results.
 */
export class CheckResultMetrics {
  public readonly identifier = "security";

  private readonly resultMetrics: SecurityCheckResultMetric[];

  constructor(results: SecurityCheckResult[]) {
    this.resultMetrics = results.map(result => this.convertResultToMetric(result));
  }

  /**
   * Get the metric representation of the check results.
   *
   * @returns An array of check results.
   */
  public collect(): Promise<SecurityCheckResultMetric[]> {
    return Promise.resolve(this.resultMetrics);
  }

  /**
   * Convert a SecurityCheckResult to a SecurityCheckResultMetric.
   *
   * @return Metric for the provided security check result.
   */
  private convertResultToMetric(result: SecurityCheckResult): SecurityCheckResultMetric {
    return {
      id: result.name,
      name: result.name,
      passed: result.passed
    };
  }
}
