export type QueueExecuteFunction<T> = (operation: T) => Promise<any>;
