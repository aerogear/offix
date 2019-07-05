// Conflict api
export * from "./api/ObjectState";
export * from "./api/ObjectConflictError";
export * from "./api/ObjectStateData";

// State implementations
export * from "./states/VersionedObjectState";
export * from "./states/HashObjectState";

// Default API state handler
export { versionStateHandler as conflictHandler }
  from "./states/VersionedObjectState";
