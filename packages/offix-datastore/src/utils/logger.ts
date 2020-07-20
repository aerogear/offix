import debug, { Debugger } from "debug";

export function createLogger(name: string): Debugger {
  return debug(`datasync:${name}`);
}

export function enableLogger() {
  if (window?.localStorage) {
    window.localStorage.setItem('debug', 'datasync:*');
  }
}
