declare var window: any;
declare var navigator: any;

/**
 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
 *
 * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap in the Ripple emulator) nor
 * Cordova `onDeviceReady`, which would normally wait for a callback.
 *
 * @return {boolean} isMobileCordova
 */
export const isMobileCordova = () => (
  typeof window !== "undefined" &&
  // tslint:disable-next-line:no-string-literal
  !!(window["cordova"] || window["phonegap"] || window["PhoneGap"])
);

/**
 * Detect if device is running in native environment as opposite to browser platform
 *
 * @return {boolean} Is running in native
 */
export const isNative = () => isMobileCordova();

export const isCordovaAndroid = () => (
  window.device.platform === "Android"
);

export const isCordovaIOS = () => (
  window.device.platform === "iOS"
);
