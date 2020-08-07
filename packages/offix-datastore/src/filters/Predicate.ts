import { OperatorFunctionMap, AllOperators } from "./Operators";

class Check {
    private fieldkey: string;
    private filter: any;

    constructor(fieldkey: string, filter: any) {
        this.fieldkey = fieldkey;
        this.filter = filter;
    }

    public isPassed(object: any) {
        const actualValue = object[this.fieldkey];
        return Object.keys(this.filter)
            .reduce((prev, cur) => {
                const op = OperatorFunctionMap[cur as AllOperators];
                const targetValue = this.filter[cur];
                return prev && op.opFunction(actualValue, targetValue);
            }, true);
    }
}

class Predicate {
    public readonly checks: Check[];

    constructor(checks: Check[] = []) {
        this.checks = checks;
    }

    public filter(data: any[]) {
        return data.filter((val) => this.testPassAllChecks(val));
    }

    private testPassAllChecks(value: any) {
        return this.checks.reduce((prev, cur) => {
            return prev && cur.isPassed(value);
        }, true);
    }
}

export const createPredicateFrom = (filter: any) => {
    const checks = Object.keys(filter)
        .filter((fieldKey) => (fieldKey !== 'or' && fieldKey !== 'and' && fieldKey !== 'not'))
        .map((fieldkey) => new Check(fieldkey, filter[fieldkey]));
    return new Predicate(checks);
}
