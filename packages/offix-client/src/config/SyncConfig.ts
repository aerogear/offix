import { isMobileCordova, ServiceConfiguration, ConfigurationService } from "@aerogear/core";
import { PersistedData, PersistentStore } from "offix-offline";
import { ConfigError } from "./ConfigError";
import { DataSyncConfig } from "./DataSyncConfig";
import { CordovaNetworkStatus, NetworkStatus, WebNetworkStatus, OfflineQueueListener } from "offix-offline";
import { clientWins } from "offix-offline";
import { VersionedState } from "offix-offline";
import { ConflictResolutionStrategy } from "offix-offline";
import { createDefaultOfflineStorage } from "offix-offline";
import { AuthContextProvider } from ".";
import { createDefaultCacheStorage } from "../cache";

declare var window: any;

// Legacy platform configuration that needs to be merged into sync configuration
const TYPE: string = "sync-app";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class SyncConfig implements DataSyncConfig {
  public wsUrl?: string;
  public httpUrl?: string;
  public offlineQueueListener?: OfflineQueueListener;
  public authContextProvider?: AuthContextProvider;
  public fileUpload?: boolean;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider = new VersionedState();
  public networkStatus: NetworkStatus;

  public cacheStorage: PersistentStore<PersistedData>;
  public offlineStorage: PersistentStore<PersistedData>;

  public retryOptions = {
    delay: {
      initial: 1000,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 5
    }
  };

  constructor(clientOptions?: DataSyncConfig) {
    if (clientOptions && clientOptions.storage) {
      this.cacheStorage = clientOptions.storage;
      this.offlineStorage = clientOptions.storage;
    } else {
      this.cacheStorage = createDefaultCacheStorage();
      this.offlineStorage = createDefaultOfflineStorage();
    }
    this.networkStatus = (isMobileCordova()) ?
      new CordovaNetworkStatus() : new WebNetworkStatus();

    if (clientOptions && clientOptions.conflictStrategy) {
      this.conflictStrategy = clientOptions.conflictStrategy;
    } else {
      this.conflictStrategy = clientWins;
    }
    this.init(clientOptions);
  }

  private init(clientOptions?: DataSyncConfig) {
    Object.assign(this, clientOptions);
    this.validate();
  }

  private validate() {
    if (!this.httpUrl) {
      throw new ConfigError("Missing server URL", "httpUrl");
    }
  }
}
