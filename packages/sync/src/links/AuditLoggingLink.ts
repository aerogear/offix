import { NextLink, Operation } from "apollo-link/src/types";
import { ApolloLink } from "apollo-link";

export class AuditLoggingLink extends ApolloLink {

  private clientId: string;
  private metricsPayload: any;

  constructor(clientId: string, metricsPayload: any) {
    super();
    this.clientId = clientId;
    this.metricsPayload = metricsPayload;
  }

  public request(operation: Operation, forward?: NextLink) {
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
