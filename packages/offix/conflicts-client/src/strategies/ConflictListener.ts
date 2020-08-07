import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Listener that allows users to track conflict information
 */
export interface ConflictListener {

  /**
   * Notifies clients when data conflict occured and it was resolved using one of the predefined strategy.
   *
   * @param operationName - operation name for mutation that being processed.
   * For example getUsers
   * @param resolvedData - data that was sent back to server
   * @param server - server data
   * @param client - client data
   */
  conflictOccurred(operationName: string,
                   resolvedData: ConflictResolutionData,
                   server: ConflictResolutionData,
                   client: ConflictResolutionData): void;

  /**
   * Notifies clients when data for the same record was changed and merged with current data.
   * This means that provided data was used as it is and there were not data lost related to hard conflict.
   *
   * @param operationName - operation name for mutation that being processed.
   * For example getUsers
   * @param resolvedData - data that was sent back to server
   * @param server - server data
   * @param client - client data
   */
  mergeOccurred?(operationName: string,
                 resolvedData: ConflictResolutionData,
                 server: ConflictResolutionData,
                 client: ConflictResolutionData): void;

}
