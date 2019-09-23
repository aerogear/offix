import { IResultProcessor } from "./IResultProcessor";
import { FetchResult } from "apollo-link";
import { isClientGeneratedId } from "offix-cache";
import { QueueEntry } from "../OfflineQueue";
import { MutationOptions } from "offix-cache/node_modules/apollo-client";

/**
 * Allow updates on items created while offline.
 * If item is created while offline and client generated ID is provided
 * to optimisticResponse, later mutations on this item will be using this client
 * generated ID. Once any create operation is successful, we should
 * update entries in queue with ID returned from server.
 */
export class IDProcessor implements IResultProcessor<MutationOptions> {

  public execute(queue: Array<QueueEntry<MutationOptions>>, entry: QueueEntry<MutationOptions>, result: FetchResult) {
    if (!entry || !entry.operation || !entry.operation.op) {
      return;
    }
    const op = entry.operation.op;
    const operationName = op.context.operationName as string;
    const optimisticResponse = op.optimisticResponse as {[key: string]: any};
    const idField = op.context.idField || "id";

    if (!result || !optimisticResponse || !optimisticResponse[operationName]) {
      return;
    }

    let clientId = optimisticResponse[operationName][idField];
    if (!clientId) {
      return;
    }
    // Ensure we dealing with string
    clientId = clientId.toString();
    if (isClientGeneratedId(optimisticResponse[operationName][idField])) {
      queue.forEach(({ operation }) => {
        if (operation.op.variables && operation.op.variables[idField] === clientId) {
         operation.op.variables[idField] = result.data && result.data[operationName][idField];
        }
      });
    }
  }
}
