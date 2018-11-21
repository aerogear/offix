class NetworkStatus {

  /**
   *
   * Trigger a function whenever the user switches into "Online Mode"
   *
   * @param fn Function to be called when got online
   */
  public static whenOnline(fn: any): void {
    window.addEventListener("online", fn, false);
  }

  /**
   *
   * Trigger a function whenever the user switches into "Offline Mode"
   *
   * @param fn Function to be called when got offline
   */
  public static whenOffline(fn: any): void {
    window.addEventListener("offline", fn, false);
  }

}

export default NetworkStatus;
