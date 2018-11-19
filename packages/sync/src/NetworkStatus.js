class NetworkStatus {

  static whenOnline(fn) {
    window.addEventListener('online', fn, false);
  }

  static whenOffline(fn) {
    window.addEventListener('offline', fn, false);
  }

}

export default NetworkStatus;
