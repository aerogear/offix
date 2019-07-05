import { GraphQLError } from "graphql";
import { ObjectStateData } from "./ObjectStateData";

/**
 * Data returned back to client wrapped in error objects.
 * Client side link highly depend on this data to notify client about conflict
 * and eventually perform client side conflict resolution
 */
export interface ConflictData {

  /**
   * Data that was modified on the server.
   * Source of the conflict with additional fields that changed over the time.
   */
  serverState: ObjectStateData;

  /**
   * Original data that was sent from client and cannot be applied because of conflict
   */
  clientState: ObjectStateData;
}

/**
 * Conflict error that is being returned when server
 * Error specific to Offix Conflict framework
 */
export class ObjectConflictError extends Error {
  public conflictInfo: ConflictData;

  constructor(data: ConflictData) {
    super("OffixConflict");
    this.conflictInfo = data;
  }
}
