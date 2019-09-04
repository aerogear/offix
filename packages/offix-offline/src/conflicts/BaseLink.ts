import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";;

export class BaseLink extends ApolloLink {

  constructor() {
    super();
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    console.log(JSON.stringify(operation, null, 2))
    debugger
    return forward(operation);
  }
}
