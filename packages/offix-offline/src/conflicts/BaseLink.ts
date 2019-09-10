import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";

export class BaseLink extends ApolloLink {

  constructor() {
    super();
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    return forward(operation);
  }
}
