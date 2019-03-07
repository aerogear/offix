import { isMobileCordova, ServiceConfiguration } from "@aerogear/core";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { ConfigError } from "./ConfigError";
import { DataSyncConfig } from "./DataSyncConfig";
import { CordovaNetworkStatus, NetworkStatus, WebNetworkStatus } from "../offline";
import { clientWins } from "../conflicts/strategies";
import { VersionedState } from "../conflicts/VersionedState";
import { ConflictResolutionStrategies } from "../conflicts";
import { defaultRetryFn } from "../offline/retry/ShouldRetry";

declare var window: any;

// Legacy platform configuration that needs to be merged into sync configuration
const TYPE: string = "sync-app";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class SyncConfig implements DataSyncConfig {
  /**
   * Platform configuration that is generated and supplied by OpenShift
   *
   * @param config user supplied configuration
   */
  private static applyPlatformConfig(config: DataSyncConfig) {
    if (config.openShiftConfig) {
      const configuration = config.openShiftConfig.getConfigByType(TYPE);
      if (configuration && configuration.length > 0) {
        const serviceConfiguration: ServiceConfiguration = configuration[0];
        config.httpUrl = serviceConfiguration.url;
        config.wsUrl = serviceConfiguration.config.websocketUrl;
      }
    }
  }

  private static validate(userConfig: DataSyncConfig) {
    if (!userConfig.httpUrl) {
      throw new ConfigError("Missing server URL", "httpUrl");
    }
  }

  public storage?: PersistentStore<PersistedData>;
  public mutationsQueueName = "offline-mutation-store";
  public auditLogging = false;
  public conflictStrategy: ConflictResolutionStrategies;
  public conflictStateProvider = new VersionedState();
  public shouldRetry = defaultRetryFn;

  public networkStatus: NetworkStatus;
  private clientConfig: DataSyncConfig;

  constructor(clientOptions?: DataSyncConfig) {
    if (window) {
      this.storage = window.localStorage;
    }
    this.networkStatus = (isMobileCordova()) ?
      new CordovaNetworkStatus() : new WebNetworkStatus();

    if (clientOptions && clientOptions.conflictStrategy) {
      this.conflictStrategy = clientOptions.conflictStrategy;
      if (!clientOptions.conflictStrategy.default) {
        this.conflictStrategy.default = clientWins;
      }
    } else {
      this.conflictStrategy = { default: clientWins };
    }
    this.clientConfig = this.init(clientOptions);
  }

  public getClientConfig(): DataSyncConfig {
    return this.clientConfig;
  }

  private init(clientOptions?: DataSyncConfig) {
    const config = this.merge(clientOptions);
    SyncConfig.applyPlatformConfig(config);
    SyncConfig.validate(config);
    return config;
  }

  /**
   * Method used to join user configuration with defaults
   */
  private merge(clientOptions?: DataSyncConfig): DataSyncConfig {
    return Object.assign(this, clientOptions);
  }

}
