import { NonEmulatedCheck, NonRootedCheck, DebuggerCheck } from "./checks";

/**
 * Detect whether a device is rooted (Android) or Jailbroken (iOS).
 */
export const notRooted = new NonRootedCheck();
/**
 * Detect whether a device is running on an emulator
 */
export const notEmulated = new NonEmulatedCheck();

export const notDebugger = new DebuggerCheck();
