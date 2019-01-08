import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Listener that allows users to track conflict information
 */
export interface ConflictListener {
/**
 * @param operationName - operation name for mutation that being processed.
 * For example getUsers
 * @param server - server data
 * @param client - client data
 * @param resolvedData - data that was sent back to server
 */
  conflictOccurred(operationName: string,
                   resolvedData: ConflictResolutionData,
                   server: ConflictResolutionData,
                   client: ConflictResolutionData
  ): void;
}
