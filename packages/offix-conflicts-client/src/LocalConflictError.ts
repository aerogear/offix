/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 *
 * Local conflict happens when user opens view with cached data and in the mean time
 * cache gets updated by subscriptions. In this case it makes no sense to send request to server as we know
 * that data was outdated. Developers need to handle this use case instantly
 * (instead enqueuing data for offline processing)
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
