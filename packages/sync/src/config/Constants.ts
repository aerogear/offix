/**
 * Client side defined directives
 */
export enum LocalDirectives {
  ONLINE_ONLY = "onlineOnly",
  NO_SQUASH = "noSquash"
}

/**
 * Config error type used to determine if conflict happened
 */
export const CONFLICT_ERROR = "AgSync:DataConflict";

// Feature loggers
export const MUTATION_QUEUE_LOGGER = "AeroGearSync:OfflineMutations";
