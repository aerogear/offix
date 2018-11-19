class NetworkStatus {

  public static whenOnline(fn: any): void {
    window.addEventListener("online", fn, false);
  }

  public static whenOffline(fn: any): void {
    window.addEventListener("offline", fn, false);
  }

}

export default NetworkStatus;
