import { Operation } from "apollo-link";

export type ShouldRetryFn = (count: number, operation: Operation, error: any) => boolean;

export const defaultRetryFn: ShouldRetryFn = (count) => count < 3;
