import debug, { Debugger } from "debug";

export function createLogger(name: string): Debugger {
  return debug(`datasync:${name}`);
}
