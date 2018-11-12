import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import { GraphQLError } from "graphql";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { ConflictResolutionData, strategies } from "./strategies";

export class ConflictLink {
    private config: DataSyncConfig;

    constructor(config: DataSyncConfig) {
        this.config = config;
    }

    /**
     * Initialise the conflict link
     * @returns An apollo link capable of detecting errors
     */
    public init(): ApolloLink {
        const link = onError(({ graphQLErrors, operation, forward }) => {
            const data = this.getConflictData(graphQLErrors);
            if (!this.config.conflictStrategy) {
                this.config.conflictStrategy = strategies.diffMergeClientWins;
            }
            const resolvedConflict = this.config.conflictStrategy(data, operation.variables);
            // TODO Notify
            resolvedConflict.version = data.version;
            operation.variables = resolvedConflict;
            return forward(operation);
        });

        return link;
    }

    /**
    * Fetch conflict data from the errors returned from the server
    * @param graphQLErrors array of errors to retrieve conflicted data from
    */
    private getConflictData = (graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictResolutionData => {
        if (graphQLErrors) {
            for (const err of graphQLErrors) {
                if (err.extensions) {
                    // TODO need to add flag to check if conflict was resolved on the server
                    if (err.extensions.exception.type === "AgSync:DataConflict") {
                        return err.extensions.exception.data;
                    }
                }
            }
        }
    }

}
