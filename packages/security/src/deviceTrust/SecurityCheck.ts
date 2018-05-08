import { SecurityCheckResult } from "./SecurityCheckResult";

export interface SecurityCheck {
  name: string;

  check(): Promise<SecurityCheckResult>;
}
