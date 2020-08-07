
/**
 *
 * Represents error object returned to user when offline
 *
 * Usage:
 * ```javascript
 * client.mutate(...).catch((error)=> {
 *  if(error.networkError && error.networkError.offline){
 *    const offlineError: OfflineError =  error.networkError;
 *    offlineError.watchOfflineChange().then(...)
 *  }
 * });
 * ```
 */
export class OfflineError {
  public offline = true;
  public offlineMutatePromise: Promise<any>;

  public constructor(offlineMutatePromise: Promise<any>) {
    this.offlineMutatePromise = offlineMutatePromise;
  }

  public watchOfflineChange(): Promise<any> {
    return this.offlineMutatePromise;
  }
}
