import { SecurityCheck, SecurityCheckResult } from "./deviceTrust";

export class SecurityService {
  public check(check: SecurityCheck): Promise<SecurityCheckResult> {
    return check.check();
  }
}
