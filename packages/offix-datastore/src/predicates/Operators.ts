type CommonOperators = "ne" | "eq" | "le" | "lt" | "ge" | "gt" | "in";

/**
 * All Operators
 *
 * 'ne' - Is value not equal to input
 * 'eq' - Is value equal to input
 * 'le' - Is value less than or equal to input
 * 'lt' - Is value strictly less than input
 * 'ge' - Is value greater than or equal to input
 * 'gt' - Is value strictly greater than input
 * 'in' - Does input array or string contain value
 * 'contains' - Is the input contained in value(array or string)
 * 'startsWith' - Does value start with input string
 * 'endsWith' - Does value end with input string
 */
export type AllOperators = CommonOperators | "contains" | "startsWith" | "endsWith";

/**
 * Maps data type to allowed operators
 */
export type TypeOperatorMap<T> =
    T extends string ? AllOperators :
    T extends number[] ? CommonOperators | "contains" :
    T extends number ? CommonOperators :
    T extends boolean[] ? "ne" | "eq" | "in" | "contains" :
    T extends boolean ? "ne" | "eq" | "in" :
    T extends Date[] ? CommonOperators | "contains" :
    T extends Date ? CommonOperators :
    AllOperators;

export const OperatorFunctionMap = {
    ne: (m: any, v: any) => m !== v,
    eq: (m: any, v: any) => m === v,
    ge: (m: number | string | Date, v: number | string | Date) => m >= v,
    gt: (m: number | string | Date, v: number | string | Date) => m > v,
    le: (m: number | string | Date, v: number | string | Date) => m <= v,
    lt: (m: number | string | Date, v: number | string | Date) => m < v,
    in: (m: any, v: any[] | string) => v.includes(m),
    contains: (m: any[] | string, v: string) => m.includes(v),
    startsWith: (m: string, v: string) => m.startsWith(v),
    endsWith: (m: string, v: string) => m.endsWith(v)
};
