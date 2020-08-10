import invariant from "tiny-invariant";
import { AllOperators, Filter } from "../../..";

type OperatorToSQL = {
    [P in keyof AllOperators]: (key: string, value: any) => string
};

const defaultOp = (op: string) => (
    (key: string, value: any) => {
        if ("string" === typeof value) {
            value = `'${value}'`;
        }
        return `${key} ${op} ${value}`;
    }
);

// TODO contains
const OperatorToSQLMap: OperatorToSQL = {
    eq: defaultOp('='),
    gt: defaultOp('>'),
    ge: defaultOp('>='),
    lt: defaultOp('<'),
    le: defaultOp('<='),
    ne: defaultOp('!='),
    in: defaultOp('IN'),
    contains: defaultOp(''),
    startsWith: (key, value) => `${key} LIKE '${value}%'`,
    endsWith: (key, value) => `${key} LIKE '%${value}'`
};

const extractExpression = (filter: any, separator: 'AND' | 'OR' = 'AND'): string => {
    const keys = Object.keys(filter);
    const expression = keys.map(key => {
        if (!(filter[key] instanceof Object)) {
            return OperatorToSQLMap.eq(key, filter[key]);
        }

        switch (key) {
            case 'not':
                return `NOT ${extractExpression(filter[key])}`;

            case 'and':
                return extractExpression(filter[key]);

            case 'or':
                return extractExpression(filter[key], 'OR');

            default:
                const op = Object.keys(filter[key])[0];
                const operator = OperatorToSQLMap[(op as keyof AllOperators)];
                invariant(operator, "Operator not supported");

                const value = filter[key][op];
                return operator(key, value);
        }
    }).join(` ${separator} `);

    return `(${expression})`;
}

export const filterToSQL = (filter?: Filter) => {
    if (!filter) { return ""; };
    return `WHERE ${extractExpression(filter)} ?`;
};
