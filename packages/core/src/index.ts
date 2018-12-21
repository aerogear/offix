/**
 * @module @aerogearservices/core
 *
 * Module used to aggregate common functionalities for AeroGear Services SDK's
 */
import console from "loglevel";
console.setDefaultLevel(console.levels.WARN);

// Configuration parsers
export * from "./config";

export * from "./Core";

export * from "./PlatformUtils";

export { MetricsBuilder } from "./metrics/MetricsBuilder";
export { Metrics } from "./metrics/model/Metrics";
export { AppMetrics } from "./metrics/model/AppMetrics";
export { DeviceMetrics } from "./metrics/model/DeviceMetrics";
