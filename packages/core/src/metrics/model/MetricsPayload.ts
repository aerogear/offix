import { MetricsType } from "./";

export interface MetricsPayload {

  clientId: string;
  type: MetricsType;
  timestamp?: number;
  data: any;

}
