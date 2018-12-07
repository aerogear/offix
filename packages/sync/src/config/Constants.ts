/**
 * Client side defined directives
 */
export enum localDirectives {
  ONLINE_ONLY = "onlineOnly",
  NO_SQUASH = "noSquash"
}

export const localDirectivesArray = [ localDirectives.ONLINE_ONLY, localDirectives.NO_SQUASH ];
/**
 * Config error type used to determine if conflict happened
 */
export const CONFLICT_ERROR = "AgSync:DataConflict";

// Feature loggers
export const MUTATION_QUEUE_LOGGER = "AeroGearSync:OfflineMutations";
