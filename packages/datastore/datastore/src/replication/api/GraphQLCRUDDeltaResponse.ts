
/**
 * Response from the GraphQL delta request
 */
export interface GraphQLDeltaResponse<T> {
  lastSync: string;
  items: T[];
  limit: number;
  offset: number;
}
