// Conflict api
export * from './api/ObjectState'
export * from './api/ConflictResolution'
export * from './api/ObjectStateData'

// State implementations
export * from './states/VersionedObjectState'
export * from './states/HashObjectState'

// Strategy implementations
export * from './strategies'

// Default API state handler
export { versionStateHandler as conflictHandler }
  from './states/VersionedObjectState'
