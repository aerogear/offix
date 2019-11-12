import { isMobileCordova } from "../utils/platform";
import { DefaultOffixExecutor } from "../utils/DefaultOffixExecutor";
import { OffixOptions } from "./OffixOptions";
import {
  CordovaNetworkStatus,
  NetworkStatus,
  WebNetworkStatus
} from "offix-offline";

import { OffixSchedulerExecutor } from "../OffixSchedulerExecutor";
import {
  createDefaultOfflineStorage,
  DefaultOfflineSerializer,
  OfflineStoreSerializer,
  PersistedData,
  PersistentStore
} from "../store";
import { OfflineQueueListener } from "../queue";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class OffixConfig implements OffixOptions {
  public executor: OffixSchedulerExecutor;
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
