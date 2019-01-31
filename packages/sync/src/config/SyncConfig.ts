import { ServiceConfiguration, isMobileCordova } from "@aerogear/core";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { ConfigError } from "./ConfigError";
import { DataSyncConfig } from "./DataSyncConfig";
import { WebNetworkStatus } from "../offline";
import { CordovaNetworkStatus } from "../offline";
import { diffMergeClientWins } from "../conflicts/strategies";
import { VersionedNextState } from "../conflicts/VersionedNextState";
import { AeroGearApp } from "@aerogear/app";

declare var window: any;

// Legacy platform configuration that needs to be merged into sync configuration
const TYPE: string = "sync-app";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class SyncConfig implements DataSyncConfig {
  public storage?: PersistentStore<PersistedData>;
  public mutationsQueueName = "offline-mutation-store";
  public mergeOfflineMutations = true;
  public auditLogging = false;
  public conflictStrategy = diffMergeClientWins;
  public conflictStateProvider = new VersionedNextState();

  public networkStatus = (isMobileCordova()) ? new CordovaNetworkStatus() : new WebNetworkStatus();

  constructor() {
    if (window) {
      this.storage = window.localStorage;
    }
  }

  /**
   * Method used to join user configuration with defaults
   */
  public merge(clientOptions?: DataSyncConfig): DataSyncConfig {
    return Object.assign(this, clientOptions);
  }

  /**
   * Platform configuration that is generated and supplied by OpenShift
   *
   * @param config user supplied configuration
   */
  public applyPlatformConfig(config: DataSyncConfig) {
    if (config.openShiftApp) {
      const configuration = config.openShiftApp.getConfigByType(TYPE);
      if (configuration && configuration.length > 0) {
        const serviceConfiguration: ServiceConfiguration = configuration[0];
        config.httpUrl = serviceConfiguration.url;
        config.wsUrl = serviceConfiguration.config.websocketUrl;
      }
    }
  }

  public validate(userConfig: DataSyncConfig) {
    if (!userConfig.httpUrl) {
      throw new ConfigError("Missing server URL", "httpUrl");
    }
  }
}
