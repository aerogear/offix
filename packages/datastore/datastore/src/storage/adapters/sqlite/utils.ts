import invariant from "tiny-invariant";

// TODO change to constants/enums
export const prepareStatement = (input: any, type: string = "insert"): [string, any[]] => {
    if (type === "insert") {
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
