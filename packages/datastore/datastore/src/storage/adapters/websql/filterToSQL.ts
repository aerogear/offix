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

export const filterToSQL = (filter?: Filter) => {
    if (!filter) { return ""; };

    const tokens: string[] = [];

    Object.keys(filter).forEach((key) => {
        if (!(filter[key] instanceof Object)) {
            tokens.push(`eq=${filter[key]}`);
            return;
        }
        const op = Object.keys(filter[key])[0];
        const operator = OperatorToSQLMap[(op as keyof AllOperators)];
        invariant(operator, "Operator not supported");

        const value = filter[key][op];
        tokens.push(operator(key, value));
    });

    return `WHERE ${tokens.join(" AND ")} ?`;
};
