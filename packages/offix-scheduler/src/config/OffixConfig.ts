import { isMobileCordova } from "../utils/platform";
import { DefaultOffixExecutor } from "../utils/DefaultOffixExecutor";
import { PersistedData, PersistentStore, OfflineQueueListener } from "offix-offline";
import { OffixOptions } from "./OffixOptions";
import { CordovaNetworkStatus, NetworkStatus, WebNetworkStatus } from "offix-offline";
import { createDefaultOfflineStorage } from "offix-offline";
import { OfflineStoreSerializer } from "offix-offline/types/offline/storage/OfflineStoreSerializer";
import { OffixExecutor } from "../Offix";
import { DefaultOfflineSerializer } from "../utils/DefaultOfflineSerializer";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class OffixConfig implements OffixOptions {
  public executor: OffixExecutor;
  public networkStatus: NetworkStatus;
  public offlineStorage: PersistentStore<PersistedData>;
  public serializer: OfflineStoreSerializer<any>;
  public offlineQueueListener?: OfflineQueueListener<any>;

  constructor(options: OffixOptions) {
    this.executor = options.executor || new DefaultOffixExecutor();

    if (options.networkStatus) {
      this.networkStatus = options.networkStatus;
    } else {
      this.networkStatus = (isMobileCordova()) ?
      new CordovaNetworkStatus() : new WebNetworkStatus();
    }

    this.offlineStorage = options.storage || createDefaultOfflineStorage();
    this.serializer = options.serializer || new DefaultOfflineSerializer();
    this.offlineQueueListener = options.offlineQueueListener;
  }
}
