import { AeroGearConfiguration, MetricsPublisher, MetricsService } from "@aerogear/core";
import { SecurityCheck, SecurityCheckResult } from "./deviceTrust";
import { CheckResultMetrics } from "./metrics";

/**
 * Service module for handling performing and reporting  possible security
 * issues in a mobile application.
 *
 * This requires the @aerogear/cordova-plugin-aerogear-security plugin to be
 * included in an application.
 */
export class SecurityService {
  private static readonly METRICS_KEY = "security";

  /**
   * Execute the provided security check and return the result.
   *
   * @returns The result of the provided check.
   */
  public check(check: SecurityCheck): Promise<SecurityCheckResult> {
    return check.check();
  }

  /**
   * Execute the provided security checks and return the results in an array.
   *
   * @returns An array of results for the provided checks.
   */
  public checkMany(...checks: SecurityCheck[]): Promise<SecurityCheckResult[]> {
    return Promise.all(checks.map(check => check.check()));
  }

  /**
   * Publish metrics results from self defence checks to a metrics service.
   * Application configuration must be provided to the security service on
   * creation, otherwise metrics sending will always fail.
   *
   * @return Promise with the result of the underlying metrics publisher.
   */
  public publishCheckResultMetrics(results: SecurityCheckResult[], metricsService: MetricsService): Promise<any>  {
    if (!results || results.length === 0) {
      return Promise.resolve(null);
    }

    const checkResultMetrics = new CheckResultMetrics(results);
    return metricsService.publish(SecurityService.METRICS_KEY, [checkResultMetrics])
    .then(() => checkResultMetrics);
  }
}
