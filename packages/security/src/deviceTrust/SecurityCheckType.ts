import { DeviceLockCheck, NonDebugCheck, NonEmulatedCheck, NonRootedCheck } from "./checks";

/**
 * Detect whether a device is rooted (Android) or Jailbroken (iOS).
 */
export const notRooted = new NonRootedCheck();
/**
 * Detect whether a device is running on an emulator
 */
export const notEmulated = new NonEmulatedCheck();
  /**
   * Detect whether a device is running in debug mode.
   */
export const notDebugMode = new NonDebugCheck();
/**
 * Detect whether a device has a screen lock set or not.
 */
export const hasDeviceLock = new DeviceLockCheck();
