import { ObjectStateData } from './ObjectStateData'

/**
 * @param serverState server side data
 * @param clientState client side data
 *
 * @throws ObjectConflictError with resolution info
 */
export type ConflictResolutionStrategy = (serverState: ObjectStateData, clientState: ObjectStateData) => Promise<ObjectStateData> | ObjectStateData
