import { OperationDefinitionNode, NameNode } from "graphql";
import { hasDirectives } from "apollo-utilities";
import { localDirectives } from "../config/Constants";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import debug from "debug";

export const logger = debug(MUTATION_QUEUE_LOGGER);
/**
 * Merge offline operations that are made on the same object.
 * Equality of operation is done by checking operationName and object id.
 */
export function squashOperations(entry: OperationQueueEntry, opQueue: OperationQueueEntry[]): OperationQueueEntry[] {
  if (hasDirectives([localDirectives.NO_SQUASH], entry.operation.query)) {
    opQueue.push(entry);
    return opQueue;
  }
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
      return !!(queueEntry.operation.operationName === operationName.value &&
        queueEntry.operation.variables.id === objectID);
    });
    // if not found, add new operation directly
    if (index === -1) {
      opQueue.push(entry);
    } else {
      logger("Squashing operation with existing item");
      // else if found, merge the variables
      opQueue[index].operation.variables = Object.assign(
        opQueue[index].operation.variables, variables);
    }
  } else {
    opQueue.push(entry);
  }
  return opQueue;
}
