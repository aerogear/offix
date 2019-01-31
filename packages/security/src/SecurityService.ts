import { DeviceCheck, DeviceCheckResult } from "./deviceTrust";
import { CheckResultMetrics, SecurityCheckResultMetric } from "./metrics";
import { AeroGearApp, ConfigurationService } from "@aerogear/app";
import { MetricsService } from "@aerogear/core";

/**
 * Service module for handling performing and reporting  possible security
 * issues in a mobile application.
 *
 * This requires the @aerogear/cordova-plugin-aerogear-security plugin to be
 * included in an application.
 */
export class SecurityService {
  private static readonly METRICS_KEY = "security";

  constructor(private metrics?: MetricsService) {
  }

  /**
   * Execute the provided security check and return the result.
   *
   * @returns The result of the provided check.
   */
  public check(check: DeviceCheck): Promise<DeviceCheckResult> {
    return check.check();
  }

  /**
   * Execute the provided security check and publish the result as a metric.
   *
   * @return The sent metric for the check result.
   */
  public checkAndPublishMetric(check: DeviceCheck): Promise<SecurityCheckResultMetric> {
    return this.check(check)
      .then(checkResult => this.publishCheckResultMetrics(checkResult))
      .then(checkMetrics => checkMetrics[0]);
  }

  /**
   * Execute the provided security checks and return the results in an array.
   *
   * @returns An array of results for the provided checks.
   */
  public checkMany(...checks: DeviceCheck[]): Promise<DeviceCheckResult[]> {
    return Promise.all(checks.map(check => check.check()));
  }

  /**
   * Execute the provided security checks and publish the results as metrics.
   *
   * @return An array of the sent metrics.
   */
  public checkManyAndPublishMetric(...checks: DeviceCheck[]): Promise<SecurityCheckResultMetric[]> {
    return this.checkMany(...checks)
      .then(checkResults => this.publishCheckResultMetrics(...checkResults));
  }

  /**
   * Publish metrics results from self defence checks to a metrics service.
   * Application configuration must be provided to the security service on
   * creation, otherwise metrics sending will always fail.
   *
   * @return Promise with the result of the underlying metrics publisher.
   */
  private publishCheckResultMetrics(...results: DeviceCheckResult[]): Promise<SecurityCheckResultMetric[]> {
    if (!results || results.length === 0) {
      return Promise.resolve([]);
    }

    const checkResultMetrics = new CheckResultMetrics(results);
    if (!this.metrics) {
      return Promise.reject(new Error("Metrics configuration is not available."));
    }

    return this.metrics.publish(SecurityService.METRICS_KEY, [checkResultMetrics])
      .then(() => checkResultMetrics.collect());
  }
}
