import { NonEmulatedCheck, NonRootedCheck, DebuggerCheck } from "./checks";

/**
 * Detect whether a device is rooted (Android) or Jailbroken (iOS).
 */
export const notRooted = new NonRootedCheck();
/**
 * Detect whether a device is running on an emulator
 */
export const notEmulated = new NonEmulatedCheck();
  /**
   * A check for whether a debugger is attached to the current application
   */
export const IsDebuggerConnected = new DebuggerCheck();



