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
export const isMobileCordova = function() {
  return (
    typeof window !== "undefined" &&
    // tslint:disable-next-line:no-string-literal
    !!(window["cordova"] || window["phonegap"] || window["PhoneGap"])
  );
};

/**
 * Detect React Native.
 *
 * @return {boolean} True if ReactNative environment is detected.
 */
export const isReactNative = function() {
  return (
    // tslint:disable-next-line:no-string-literal
    typeof navigator === "object" && navigator["product"] === "ReactNative"
  );
};
