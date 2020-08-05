import { ModelSchema } from "../../ModelSchema";
import { MODEL_METADATA, MODEL_METADATA_KEY, MUTATION_QUEUE, MUTATION_QUEUE_KEY } from "./Replicator";

export const metadataModel = new ModelSchema<any>({
  name: MODEL_METADATA,
  type: "object",
  namespace: "_",
  keyPath: MODEL_METADATA_KEY,
  properties: {
    [MODEL_METADATA_KEY]: {
      type: "string",
      primary: true,
      index: true
    }
  }
});

export const queueModel = new ModelSchema<any>({
  name: MUTATION_QUEUE,
  type: "object",
  keyPath: MUTATION_QUEUE_KEY,
  namespace: "_",
  properties: {
    [MUTATION_QUEUE_KEY]: {
      type: "string",
      primary: true,
      index: true
    }
  }
});
