import {
  ApolloLink,
  NextLink,
  Observable,
  Operation
} from "apollo-link";
import { hasDirectives, removeDirectivesFromDocument, checkDocument } from "apollo-utilities";
import { LocalDirectives, MUTATION_QUEUE_LOGGER } from "../config/Constants";
import debug from "debug";

export const logger = debug(MUTATION_QUEUE_LOGGER);

export class LocalDirectiveFilterLink extends ApolloLink {
  private connectionRemoveOnlineOnly = {
    name: "onlineOnly"
  };
  private connectionRemoveNoSquash = {
    name: "noSquash"
  };
  constructor() {
    super();
  }
  public request(operation: Operation, forward: NextLink) {
    logger("Checking if client directives need to be removed on ", operation);
    const clientDirectivesPresent = hasDirectives(
      [
        LocalDirectives.ONLINE_ONLY,
        LocalDirectives.NO_SQUASH
      ],
      operation.query
    );
    if (!clientDirectivesPresent) {
      return forward(operation);
    } else {

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
      }
      return new Observable(observer => {
        return () => ({ removedDirective: true });
      });
    }
  }
}
