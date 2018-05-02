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
