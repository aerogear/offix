import { ApolloOfflineClientConfig } from "./ApolloOfflineClientConfig";
import { ConfigError } from "./ConfigError";

export default function(config: ApolloOfflineClientConfig) {
    checkFields(config, [
        "cacheStorage", "offlineStorage", "conflictListener", "cache"
    ]);
}

function checkFields(obj: any, fields: string[]) {
    fields.forEach((fieldName) => {
        if (obj[fieldName] === undefined) {
            throw new ConfigError(
                `Offix client config error: ${fieldName} is required`, 
                fieldName
            );
        }
    });
}
