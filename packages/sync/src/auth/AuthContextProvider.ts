/**
 * Contains header and auth token information that can be supplied to graphql requests
 */
export interface AuthContext {
  header: any;
  token: string;
}

/**
 * Provides pluggable way to retrieve auth tokens for sync.
 * Clients can pass this interface to supply custom headers or
 * auth tokens that will be used to authenticate GraphQL Requests on the server
 */
export type AuthContextProvider = () => Promise<AuthContext>;
