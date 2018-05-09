import { SecurityCheck, SecurityCheckResult } from "./deviceTrust";

/**
 * Service module for handling performing and reporting  possible security
 * issues in a mobile application.
 *
 * This requires the @aerogear/cordova-plugin-aerogear-security plugin to be
 * included in an application.
 */
export class SecurityService {

  /**
   * Execute the provided security check and return the result.
   *
   * @returns A result for the security check provided.
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
}
