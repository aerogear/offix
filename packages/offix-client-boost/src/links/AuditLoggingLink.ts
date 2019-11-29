import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";

export class AuditLoggingLink extends ApolloLink {

  private readonly clientId: string;
  private readonly metricsPayload: any;

  constructor(clientId: string, metricsPayload: any) {
    super();
    this.clientId = clientId;
    this.metricsPayload = metricsPayload;
  }

  public request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null {
    if (!operation.extensions) {
      operation.extensions = {};
    }

    operation.extensions.metrics = {
      clientId: this.clientId,
      timestamp: new Date().getTime(),
      data: this.metricsPayload
    };

    if (!forward) {
      return null;
    }
    return forward(operation);
  }
}
