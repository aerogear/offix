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
   * @returns The result of the provided check.
   */
  public check(check: SecurityCheck): Promise<SecurityCheckResult> {
    return check.check();
  }
}
