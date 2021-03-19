import debug, { Debugger } from "debug";

export function createLogger(name: string): Debugger {
  return debug(`datastore:${name}`);
}

export function enableLogger() {
  if (window?.localStorage) {
    window.localStorage.setItem("debug", "datastore:*");
  }
}
