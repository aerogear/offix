import { SecurityCheck, SecurityCheckResult } from "./deviceTrust";

/**
 * Service module for handling performing and reporting checks.
 */
export class SecurityService {

  /**
   * Execute the provided security check and return the result.
   *
   * @returns {Promise<SecurityCheckResult>}
   */
  public check(check: SecurityCheck): Promise<SecurityCheckResult> {
    return check.check();
  }
}
