import { ApolloLink } from "apollo-link";

/**
 * Apollo Link builder
 */
export class LinksBulder {

  public links: ApolloLink[];

  constructor(links: ApolloLink[]) {
    this.links = links;
  }

  public build(): ApolloLink {
    return ApolloLink.from(this.links);
  }
}
