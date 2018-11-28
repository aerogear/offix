import { OperationDefinitionNode, NameNode } from "graphql";

import { OperationQueueEntry } from "../links/OfflineQueueLink";
/**
 * Merge offline operations that are made on the same object.
 * Equality of operation is done by checking operationName and object id.
 */
export function squashOperations(entry: OperationQueueEntry, opQueue: OperationQueueEntry[]): OperationQueueEntry[] {
  const { query, variables } = entry.operation;
  let operationName: NameNode;

  if (query.definitions[0]) {
    const operationDefinition = query.definitions[0] as OperationDefinitionNode;
    if (operationDefinition.name) {
      operationName = operationDefinition.name;
    }
  }
  const objectID = variables.id;
  if (opQueue.length > 0 && objectID) {
    // find the index of the operation in the array matching the incoming one
    const index = opQueue.findIndex(queueEntry => {
      if (queueEntry.operation.operationName === operationName.value &&
        queueEntry.operation.variables.id === objectID) {
        return true;
      }
      return false;
    });
    // if not found, add new operation directly
    if (index === -1) {
      opQueue.push(entry);
    } else {
      // else if found, merge the variables
      const newOperationVariables = Object.assign(opQueue[index].operation.variables, variables);
      opQueue[index].operation.variables = newOperationVariables;
    }
  } else {
    opQueue.push(entry);
  }
  return opQueue;
}
