import { ApolloLink, NextLink, Operation } from "apollo-link";
import { HeaderProvider } from "../config/HeaderProvider";

export class HeadersLink extends ApolloLink {

  private headerProvider: HeaderProvider;

  constructor(headerProvider: HeaderProvider) {
    super();
    this.headerProvider = headerProvider;
  }

  public request(operation: Operation, forward: NextLink) {
    if (this.headerProvider) {
      operation.setContext({
        headers: this.headerProvider.getHeaders()
      });
    }
    return forward(operation);
  }
}
