import {
  ConflictResolutionStrategy,
  UseClient,
  VersionedState,
  ObjectState
} from "offix-conflicts-client";
import { createDefaultLink } from '../links'
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { OffixBoostOptions } from "./OffixBoostOptions"
import { RetryLink } from "apollo-link-retry";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class OffixBoostConfig implements OffixBoostOptions {
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider: ObjectState
  public link: ApolloLink;
  public cache: any;
  public retryOptions: RetryLink.Options
  public fileUpload: boolean
  public auditLogging: boolean

  constructor(options = {} as OffixBoostOptions) {
    Object.assign(this, options);
    this.cache = options.cache || new InMemoryCache(),
    this.conflictProvider = options.conflictProvider || new VersionedState(),
    this.conflictStrategy = options.conflictStrategy || UseClient,
    this.fileUpload = options.fileUpload || false,
    this.auditLogging = options.auditLogging || false,
    this.retryOptions = options.retryOptions || {
      delay: {
        initial: 1000,
        max: Infinity,
        jitter: true
      },
      attempts: {
        max: 5
      }
    }
    this.link = createDefaultLink(this)
  }
}
