import { OperatorFunctionMap } from "../predicates";

export type Filter<T = any> = any;

// export type Filter<T = any> = {
//     [P in keyof Required<T>]: { [keyof OperatorFunctionMap]: T[P] | T[P][] }
// } & {
//     or: Filter<T>;
//     and: Filter<T>;
//     not: Filter<T>;
// };
