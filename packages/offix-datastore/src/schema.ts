import { DataSyncJsonSchema } from "./ModelSchema";

const schema: DataSyncJsonSchema<any> =  {
  "version": 0,
  "type": "object",
  "name": "Todo",
  "namespace": "user",
  "properties": {
    "id": {
      "type": "string",
      "index": true,
      "primary": true
    },
    "title": {
      "type": "string",
      "index": true
    },
    "description": {
      "type": "string"
    },
    "completed": {
      "type": "boolean"
    }
  }
};

export default schema;
