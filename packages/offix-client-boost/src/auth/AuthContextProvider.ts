/**
 * Contains header information that can be provided in GraphQL requests
 * and in connectionParams for websocket connections
 */
export interface AuthContext {
  headers: {
    [headerName: string]: any
  };
}

/**
 * Provides pluggable way to retrieve auth tokens for sync.
 * Clients can pass this interface to supply custom headers or
 * auth tokens that will be used to authenticate GraphQL Requests on the server
 */
export type AuthContextProvider = () => Promise<AuthContext>;
