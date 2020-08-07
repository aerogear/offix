import { ModelSchema } from "../../ModelSchema";
import { MODEL_METADATA, MODEL_METADATA_KEY, MUTATION_QUEUE } from "../GraphQLReplicator";

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
