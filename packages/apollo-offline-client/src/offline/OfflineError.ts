
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
  public offlineMutationPromise: Promise<any>;

  public constructor(offlineMutationPromise: Promise<any>) {
    this.offlineMutationPromise = offlineMutationPromise;
  }

  public async watchOfflineChange(): Promise<any> {
    await this.offlineMutationPromise;
  }
}
