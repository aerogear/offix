import { GraphQLError } from 'graphql'
import { ObjectStateData } from './ObjectStateData'

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
  serverState: ObjectStateData

  /**
   * Original data that was sent from client and cannot be applied because of conflict
   */
  clientState?: ObjectStateData

  /**
   * Flag used to inform client that conflict was already resolved on the server
   * and no further processing is needed. When flag is true `serverState` field will contain
   * resolved information. If value is false client will need to resolve conflict on their side
   * and both `serverState` and `clientState` will be available
   */
  resolvedOnServer: boolean
}

/**
 * A ConflictResolution is the result of the actual conflict resolution process.
 * It provides the resolvedState which is the newly resolved state that should be persisted by users.
 * It also provides a response which should be returned to the client.
 * This response is a special error class that contains information about the conflict,
 * how it was resolved, and any new state the client needs to know about.
 */
export class ConflictResolution {

  /**
   * response is the full conflict object
   * that should be sent back to the client
   */
  public response: ObjectConflictError

  /**
   * resolvedState is the newly resolved object that should be
   * persisted by developers.
   */
  public resolvedState?: ObjectStateData

  constructor(resolvedOnServer: boolean, serverState: ObjectStateData, clientState: ObjectStateData) {
    this.response = new ObjectConflictError({
      resolvedOnServer,
      serverState,
      clientState
    })
    if (resolvedOnServer) {
      this.resolvedState = serverState
    }
  }
}

/**
 * Conflict error that is being returned when server
 * Error specific to Voyager framework
 */
export class ObjectConflictError extends GraphQLError {
  public conflictInfo: any

  constructor(data: ConflictData) {
    super('VoyagerConflict')
    this.conflictInfo = data
  }
}
