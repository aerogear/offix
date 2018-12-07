import {
  ApolloLink,
  NextLink,
  Observable,
  Operation
} from "apollo-link";
import { hasDirectives, removeDirectivesFromDocument, checkDocument } from "apollo-utilities";
import { LocalDirectivesArray, MUTATION_QUEUE_LOGGER, LocalDirectives } from "../config/Constants";
import debug from "debug";

export const logger = debug(MUTATION_QUEUE_LOGGER);

export class LocalDirectiveFilterLink extends ApolloLink {
  private connectionRemoveOnlineOnly = {
    name: LocalDirectives.ONLINE_ONLY
  };
  private connectionRemoveNoSquash = {
    name: LocalDirectives.NO_SQUASH
  };
  constructor() {
    super();
  }
  public request(operation: Operation, forward: NextLink) {
    logger("Checking if client directives need to be removed on ", operation);
    const clientDirectivesPresent = hasDirectives( LocalDirectivesArray, operation.query);
    if (!clientDirectivesPresent) {
      return forward(operation);
    } else {
      // Performs a check on the query and throws errors if there is anything wrong with it.
      // Important check to perform before altering a query.
      checkDocument(operation.query);
      const newDoc = removeDirectivesFromDocument(
        [
          this.connectionRemoveOnlineOnly,
          this.connectionRemoveNoSquash
        ],
        operation.query
      );
      if (newDoc) {
        operation.query = newDoc;
        return forward(operation);
      } else {
        throw new Error("There was a problem removing client directives from the query.");
      }
    }
  }
}
