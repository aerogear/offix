import { ConflictHandlerOptions } from "./ConflictHandlerOptions";

/**
 * Filtered conflict handler enables tree stage conflict resolution:
 *
 * - checks if data conflicts exist
 * - perform resolution for conflicts or merge data otherwise
 * - notify listeners about merge/conflict
 */
export class ConflictHandler {
  public conflicted: boolean = false;
  private clientDiff: any = {};
  private serverDiff: any = {};
  private options: ConflictHandlerOptions;
  private ignoredKeys: string[];

  constructor(options: ConflictHandlerOptions) {
    this.options = options;
    this.ignoredKeys = this.options.objectState.getStateFields();
    this.checkConflict();
  }

  /**
   * Executes the supplied strategy for each handler
   */
  public executeStrategy() {
    const serverState = Object.assign({}, this.options.server);
    const resolvedData = this.options.strategy.resolve({
      base: this.options.base,
      server: this.options.server,
      serverDiff: this.serverDiff,
      client: this.options.client,
      clientDiff: this.clientDiff,
      operation: this.options.operationName
    });
    this.options.objectState.assignServerState(resolvedData, serverState);
    if (this.options.listener) {
      if (this.conflicted) {
        this.options.listener.conflictOccurred(
          this.options.operationName,
          resolvedData,
          this.options.server,
          this.options.client
        );
      } else if (this.options.listener.mergeOccurred) {
        this.options.listener.mergeOccurred(
          this.options.operationName,
          resolvedData,
          this.options.server,
          this.options.client
        );
      }
    }

    // Filter to send only original data from client
    const filteredData: any = {};
    for (const key of Object.keys(resolvedData)) {
      if (this.options.client[key]) {
        filteredData[key] = resolvedData[key];
      }
    }
    return filteredData;
  }

  private checkConflict() {
    const base = this.options.base;
    const client = this.options.client;
    const server = this.options.server;
    if (!base || !client || !server) {
      return;
    }
    // calculate client diff
    for (const key of Object.keys(client)) {
      if (base[key] && base[key] !== client[key]) {
        if (!this.ignoredKeys.includes(key)) {
          this.clientDiff[key] = client[key];
        }
      }
    }

    // calculate server diff
    for (const key of Object.keys(this.options.client)) {
      if (base[key] && base[key] !== server[key]) {
        if (!this.ignoredKeys.includes(key)) {
          this.serverDiff[key] = server[key];
          if (this.clientDiff[key]) {
            this.conflicted = true;
          }
        }
      }
    }
  }
}
