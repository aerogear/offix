import { ApolloLink, NextLink, Operation } from "apollo-link";
import { hasDirectives, removeDirectivesFromDocument } from "apollo-utilities";
import { localDirectivesArray, MUTATION_QUEUE_LOGGER } from "../utils/Constants";
import * as debug from "debug";

const logger = debug.default(MUTATION_QUEUE_LOGGER);

export class LocalDirectiveFilterLink extends ApolloLink {
  private readonly directiveRemovalConfig: any = [];

  constructor() {
    super();
    this.directiveRemovalConfig = [];
    localDirectivesArray.forEach((directive) => {
      this.directiveRemovalConfig.push({name: directive});
    });
  }
  public request(operation: Operation, forward: NextLink) {
    logger("Checking if client directives need to be removed on ", operation);
    const clientDirectivesPresent = hasDirectives( localDirectivesArray, operation.query);
    if (!clientDirectivesPresent) {
      return forward(operation);
    } else {
      const newDoc = removeDirectivesFromDocument( this.directiveRemovalConfig, operation.query );
      if (newDoc) {
        operation.query = newDoc;
        return forward(operation);
      } else {
        throw new Error("There was a problem removing client directives from the query.");
      }
    }
  }
}
