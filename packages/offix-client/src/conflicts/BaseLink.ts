import { ApolloLink, NextLink, Operation, Observable, FetchResult } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { isMutation } from "../utils/helpers";
import { getObjectFromCache } from "../utils/cacheHelper";
import { ObjectState } from ".";
import { logger } from "../links/LocalDirectiveFilterLink";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";

/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 */
export class LocalConflictError extends Error {
  /**
   * Flag used to recognize this type of error
   */
  public localConflict = true;

  constructor(public conflictBase: any, public variables: any) {
    super();
  }
}

export class BaseLink extends ApolloLink {

  constructor(private stater: ObjectState, private cache: InMemoryCache) {
    super();
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    if (isMutation(operation)) {
      return this.processBaseState(operation, forward);
    } else {
      return forward(operation);
    }
  }

  private processBaseState(operation: Operation, forward: NextLink): Observable<FetchResult> {
    const conflictBase = getObjectFromCache(operation, operation.variables.id);
    if (conflictBase && Object.keys(conflictBase).length !== 0) {
      if (this.stater.hasConflict(operation.variables, conflictBase)) {
        // 🙊 Input data is conflicted with the latest server projection
        return this.createLocalConflict(conflictBase, operation.variables);
      }
      // TODO use conflictBase as name
      operation.setContext({ conflictBase });
    }
    return forward(operation);
  }

  /**
   * Local conflict happens when user opens view with cached data and in the mean time
   * cache gets updated by subscriptions. In this case it makes no sense to send request to server as we know
   * that data was outdated. Developers need to handle this use case instantly
   * (instead enqueuing data for offline processing)
   */
  private createLocalConflict(conflictBase: ConflictResolutionData,
                              variables: ConflictResolutionData): Observable<FetchResult> {
    return new Observable(observer => {
      logger("Returning local conflict error to client");
      observer.error(new LocalConflictError(conflictBase, variables));
      return () => { return; };
    });
  }

}
