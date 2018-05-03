import { SecurityCheckResult } from "./SecurityCheckResult";

export interface SecurityCheck {
  name: string;

  test(): Promise<SecurityCheckResult>;
}
