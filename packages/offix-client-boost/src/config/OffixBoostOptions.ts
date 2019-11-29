import { AuthContextProvider } from "../auth/AuthContextProvider";
import { ApolloOfflineClientOptions } from "offix-client";
import { ApolloCache } from 'apollo-cache'
import { NormalizedCacheObject } from "apollo-cache-inmemory";

// Define Omit.  Can be defined in a utilities package
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * Contains all configuration options required to initialize Voyager Client
 * Options marked with [Modifier] flag are used to modify behavior of client.
 * SDK provides default values for all [Modifier] flags.
 * Users do not need to pass them for normal initialization of the client.
 * Please refer to documentation for more information about the individual flag and it's side effects.
 *
 * @see DefaultOptions for defaults
 */
export interface OffixBoostOptions extends Omit<ApolloOfflineClientOptions, "link"|"cache"> {
  /**
   * The URL of http server
   */
  httpUrl?: string;

  /**
   *  The URL of websocket endpoint
   */
  wsUrl?: string;

  /**
   * [Modifier]
   * 
   * An Apollo Cache instance
   */

  cache?: ApolloCache<NormalizedCacheObject>;

  /**
   * [Modifier]
   *
   * An implementation of AuthContextProvider. If none passed, a default one will be used.
   * The default one doesn't add any headers.
   */
  authContextProvider?: AuthContextProvider;

  /**
   * If set to true, GraphGL requests will include some additional data to audit log in the server side.
   */
  auditLogging?: boolean;

  /**
   * [Modifier]
   *
   * If set to true, GraphGL file uploads will be enabled and supported
   */
  fileUpload?: boolean;
}
