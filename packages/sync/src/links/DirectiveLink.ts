import {
  ApolloLink,
  NextLink,
  Observable,
  Operation
} from "apollo-link";
import { DirectiveNode } from "graphql";
import { hasDirectives, removeDirectivesFromDocument, checkDocument } from "apollo-utilities";
import { Directives, MUTATION_QUEUE_LOGGER } from "../config/Constants";
import debug from "debug";

export const logger = debug(MUTATION_QUEUE_LOGGER);

export class DirectiveLink extends ApolloLink {
  constructor() {
    super();
  }
  public request(operation: Operation, forward: NextLink) {
    logger("IN DIRECTIVE LINK, OPERATION:", operation);
    debugger;
    const clientDirectivesPresent = hasDirectives([Directives.ONLINE_ONLY, Directives.NO_SQUASH], operation.query);
    if (!clientDirectivesPresent) {
      return forward(operation);
    } else {
      const connectionRemoveOnlineOnly = {
        name: "onlineOnly",
        test: (directive: DirectiveNode) => directive.name.value === Directives.ONLINE_ONLY,
        remove: true
      };
      const connectionRemoveNoSquash = {
        name: "noSquash",
        test: (directive: DirectiveNode) => directive.name.value === Directives.NO_SQUASH,
        remove: true
      };
      checkDocument(operation.query);
      const newDoc = removeDirectivesFromDocument(
        [
          connectionRemoveOnlineOnly,
          connectionRemoveNoSquash
        ],
        operation.query
      );
      logger("NEW DOC", newDoc);
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
