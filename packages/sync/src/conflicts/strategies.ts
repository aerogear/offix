import deepmerge from "deepmerge";

const diffMergeClientWins = (server: ConflictResolutionData, client: ConflictResolutionData) => {
    return deepmerge(server, client);
};
const diffMergeServerWins = (server: ConflictResolutionData, client: ConflictResolutionData) => {
    return deepmerge(client, server);
};

export const strategies = {
    diffMergeClientWins,
    diffMergeServerWins
};

// Separate file
export type ConflictResolutionData = any;

export type ConflictResolutionStrategy =
    (server: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData;
