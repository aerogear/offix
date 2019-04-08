import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectStateData } from '../api/ObjectStateData'

function clientWinsStrategy (serverState: ObjectStateData, clientState: ObjectStateData) {
  return clientState
}

const clientWins: ConflictResolutionStrategy = clientWinsStrategy

export const strategies = {
  clientWins
}
