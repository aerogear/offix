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
export type AllOperators = MathematicalOperators & {
    contains: string;
    startsWith: string;
    endsWith: string;
};

/**
 * Maps data type to allowed operators
 */
export type TypeOperatorMap<T> =
    T extends Array<any> ? ArrayOperators :
    T extends string ? AllOperators :
    T extends number ? MathematicalOperators :
    T extends boolean ? {
        ne: boolean;
        eq: boolean;
        in: boolean;
    } :
    T extends Date ? MathematicalOperators :
    AllOperators;

/**
 * Operator class used to associate operator with underlying filtering function
 */
export class Operator {
    public readonly op: string;
    public readonly opFunction: (m: any, v: any) => boolean;

    constructor(op: string, opFunction: (m: any, v: any) => boolean) {
        this.op = op;
        this.opFunction = opFunction;
    }
}

/**
 * List of supported operators with underlying filtering functions
 */
export const OperatorFunctionMap = {
    ne: new Operator("ne", (m: any, v: any) => m !== v),
    eq: new Operator("eq", (m: any, v: any) => m === v),
    ge: new Operator("ge", (m: number | string | Date, v: number | string | Date) => m >= v),
    gt: new Operator("gt", (m: number | string | Date, v: number | string | Date) => m > v),
    le: new Operator("le", (m: number | string | Date, v: number | string | Date) => m <= v),
    lt: new Operator("lt", (m: number | string | Date, v: number | string | Date) => m < v),
    in: new Operator("in", (m: any, v: any[] | string) => v.includes(m)),
    contains: new Operator("contains", (m: any[] | string, v: string) => m.includes(v)),
    startsWith: new Operator("startsWith", (m: string, v: string) => m.startsWith(v)),
    endsWith: new Operator("endsWith", (m: string, v: string) => m.endsWith(v))
};

interface ArrayOperators {
    ne: any[];
    eq: any[];
    in: any[];
    contains: any[];
};

interface MathematicalOperators {
    ne: number;
    eq: number;
    le: number;
    lt: number;
    ge: number;
    gt: number;
    in: number;
}
