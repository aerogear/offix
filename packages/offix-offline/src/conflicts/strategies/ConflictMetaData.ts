import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * A collection of meta data which can be used to resolve a conflict client-side
 *
 * @param base - base data before any client changes were applied
 * @param server - the latest server data returned to the client
 * @param serverDiff - the difference between the server data and the common base
 * @param client - the data the client tried to send to the server
 * @param clientDiff - the difference between the client data and the common base
 * @param operation - [optional] the name of the operation you wish to perform the strategy on.
 */
export interface ConflictMetaData {
  base: ConflictResolutionData;
  server: ConflictResolutionData;
  serverDiff: ConflictResolutionData;
  client: ConflictResolutionData;
  clientDiff: ConflictResolutionData;
  operation: string;
}
