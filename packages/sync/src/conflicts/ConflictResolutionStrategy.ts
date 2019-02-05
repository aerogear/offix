import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for strategy that can be used to resolve conflict
 *
 * @param operationName - operation name for mutation that being processed.
 * For example getUsers
 * @param server - server data
 * @param client - client data
 */
export type ConflictResolutionStrategy =
  (operationName: string, server: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData;

export interface IResolver {
 [id: string]: (server: ConflictResolutionData,
                client: ConflictResolutionData) => ConflictResolutionData;
}
