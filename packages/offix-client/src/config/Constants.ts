/**
 * Client side defined directives
 */
export enum localDirectives {
  ONLINE_ONLY = "onlineOnly"
}

export const localDirectivesArray = [ localDirectives.ONLINE_ONLY ];

// Feature loggers
export const MUTATION_QUEUE_LOGGER = "AeroGearSync:OfflineMutations";
export const QUEUE_LOGGER = "AeroGearSync:Link";
