import invariant from "tiny-invariant";
import { generateId } from "../..";
import { Filter, AllOperators } from "../../..";

// TODO change to constants/enums
export const prepareStatement = (input: any, type: string = "insert"): [string, any[]] => {
    if (type === "insert") {
        input.id = generateId();
        const cols = Object.keys(input).join(",");
        const bindings = Object.keys(input).map(() => "?").join(",");
        const vals = Object.values(input);
        const statement = `(${cols}) VALUES (${bindings})`;
        return [statement, vals];
    }
    if (type === "update") {
        const statement = Object.keys(input).map((k) => {
            return `${k} = ?`;
        }).join(",");
        const vals = Object.values(input);
        return [statement, vals];
    }
    invariant(false, "Unsupported query type");
};

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

export const getType = (type: string): string => {
    const types: Record<string, string> = {
        "number": "INTEGER",
        "string": "TEXT",
        "boolean": "INTEGER"
    };
    return types[type] as string;
};

/**
 * Return the SQL result set as a flat array
 * instead of having to iterate over it at a later stage
 *
 * @param rows SQLResultSet
 */
export const flattenResultSet = (rows: SQLResultSetRowList): any[] => {
    const result: any = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        result.push(row);
    }
    return result;
};
