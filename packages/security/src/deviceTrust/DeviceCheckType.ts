import { DebuggerEnabledCheck, IsEmulatorCheck, RootEnabledCheck, ScreenLockEnabledCheck } from "./checks";

/**
 * Detect whether a device is rooted (Android) or Jailbroken (iOS).
 */
export const rootEnabled = new RootEnabledCheck();
/**
 * Detect whether a device is running on an emulator
 */
export const isEmulator = new IsEmulatorCheck();
  /**
   * Detect whether a device is running in debug mode.
   */
export const debugModeEnabled = new DebuggerEnabledCheck();
/**
 * Detect whether a device has a screen lock set or not.
 */
export const screenLockEnabled = new ScreenLockEnabledCheck();
