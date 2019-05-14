import { IResultProcessor } from "../offline/procesors/IResultProcessor";
import { OperationQueueEntry } from "../offline/OperationQueueEntry";
import { FetchResult } from "apollo-link";
import { isClientGeneratedId } from "./createOptimisticResponse";

  /**
   * Allow updates on items created while offline.
   * If item is created while offline and client generated ID is provided
   * to optimisticResponse, later mutations on this item will be using this client
   * generated ID. Once any create operation is successful, we should
   * update entries in queue with ID returned from server.
   */
export class IDProcessor implements IResultProcessor {

    public execute(queue: OperationQueueEntry[], entry: OperationQueueEntry, result: FetchResult) {
        const { operation: { operationName }, optimisticResponse } = entry;
        if (!result ||
          !optimisticResponse ||
          !optimisticResponse[operationName] ||
          !isClientGeneratedId(optimisticResponse[operationName].id)) {
          return;
        }

        const clientId = optimisticResponse && optimisticResponse[operationName].id;

        queue.forEach(({ operation: op }) => {
          if (op.variables.id === clientId) {
            op.variables.id = result.data && result.data[operationName].id;
          }
        });
      }
    }
