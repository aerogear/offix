/**
 * Object or class that contains an execute method.
 * This is the operation/business logic we want to perform
 * and schedule while offline
 */
export interface OffixSchedulerExecutor {
  execute: (options: any) => Promise<any>;
}
