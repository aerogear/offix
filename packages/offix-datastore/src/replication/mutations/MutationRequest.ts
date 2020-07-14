import { DocumentNode } from "graphql";


/**
 * Request to perform mutation.
 * This object contain all information needed to perform specific mutations
 */
export class MutationRequest {
  query: string | DocumentNode;
  options: { variables?: any };

  constructor(query: string | DocumentNode, options: { variables?: any }) {
    this.query = query;
    this.options = options;
  }
}
