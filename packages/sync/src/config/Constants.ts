/**
 * Server side defined directives
 */
export enum Directives {
  ONLINE_ONLY = "onlineOnly",
  NO_SQUASH = "noSquash"
}

/**
 * Config error type used to determine if conflict happened
 */
export const CONFLICT_ERROR = "AgSync:DataConflict";
