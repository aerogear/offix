import { NonRootedCheck } from "./checks";

/**
 * Detect whether a device is rooted (Android) or Jailbroken (iOS).
 */
export const notRooted = new NonRootedCheck();
