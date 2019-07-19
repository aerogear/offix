/**
 * Contains header information that can be supplied to graphql requests.
 * E.g.:
 * 
 * ```
 *  {
 *    headers: {
 *      Authorization: 'Bearer 123...'
 *    }
 *  }
 * ```
 */
export interface AuthContext {
  headers: {
    [headerName: string]: any
  }
}

/**
 * Provides pluggable way to retrieve auth tokens for sync.
 * Clients can pass this interface to supply custom headers or
 * auth tokens that will be used to authenticate GraphQL Requests on the server
 */
export type AuthContextProvider = () => Promise<AuthContext>;
