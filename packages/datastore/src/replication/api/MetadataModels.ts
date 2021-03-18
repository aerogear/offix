import { ModelSchema } from "../../ModelSchema";

/**
 * Queue used to hold ongoing mutations
 */
export const MUTATION_QUEUE = "mutation_request_queue";

/**
 * Contains metadata for model
 */
export const MODEL_METADATA = "query_info";
export const MODEL_METADATA_KEY = "storeName";


export interface QueryMetadata {
  storeName: string;
  lastSync: string;
}

/**
 * Used to save query metadata
 */
export const metadataModel = new ModelSchema<QueryMetadata>({
  name: MODEL_METADATA,
  type: "object",
  namespace: "meta_",
  version: 1,
  properties: {
    [MODEL_METADATA_KEY]: {
      type: "string",
      primary: true
    },
    lastSync: {
      type: "string"
    }
  }
});

/**
 * Model used for saving mutation requests in queue
 */
export const mutationQueueModel = new ModelSchema<any>({
  name: MUTATION_QUEUE,
  type: "object",
  version: 1,
  namespace: "meta_",
  properties: {
    id: {
      type: "string",
      primary: true
    },
    queue: {
      type: "array"
    },
    items: {
      type: "array"
    }
  }
});
