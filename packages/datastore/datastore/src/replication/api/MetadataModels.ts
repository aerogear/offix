import { ModelSchema } from "../../ModelSchema";

/**
 * Queue used to hold ongoing mutations
 */
export const MUTATION_QUEUE = "mutation_request_queue";

/**
 * Contains metadata for model
 */
export const MODEL_METADATA = "model_metadata";
export const MODEL_METADATA_KEY = "storeName";


export const metadataModel = new ModelSchema<any>({
  name: MODEL_METADATA,
  type: "object",
  namespace: "meta_",
  version: 1,
  properties: {
    [MODEL_METADATA_KEY]: {
      type: "string",
      primary: true,
      index: true
    }
  }
});

export const mutationQueueModel = new ModelSchema<any>({
  name: MUTATION_QUEUE,
  type: "object",
  version: 1,
  namespace: "meta_",
  properties: {
    id: {
      type: "string",
      primary: true,
      index: true
    },
    queue: {
      type: "array"
    }
  }
});
