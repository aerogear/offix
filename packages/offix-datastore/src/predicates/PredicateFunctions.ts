export abstract class PredicateFunction {
    public abstract evaluate(model: any): boolean;

    public filter(models: any[]) {
        return models.filter((m) => this.evaluate(m));
    }
}

export class ModelFieldPredicate extends PredicateFunction {
    constructor(
        private key: string,
        private value: string,
        private operator: Function
    ) {
        super();
    }

    public evaluate(model: any) {
        return this.operator(model[this.key], this.value);
    }
}

export interface ExpressionOperator {
    operate(previousResult: boolean, currentResult: boolean): boolean;
}

export const ExpressionOperators = {
    or: {
        operate: (prevResult: boolean, currentResult: boolean) => {
            return prevResult || currentResult;
        }
    },
    and: {
        operate: (prevResult: boolean, currentResult: boolean) => {
            return prevResult && currentResult;
        }
    },
    not: {
        operate: (prevResult: boolean, currentResult: boolean) => {
            return !currentResult;
        }
    }
}

export class PredicateExpression extends PredicateFunction {
    constructor(
        private predicates: PredicateFunction[], 
        private operator: ExpressionOperator
    ) {
        super();
    }

    public evaluate(model: any) {
        let result = false;

        this.predicates.forEach((value) => {
            result = this.operator.operate(result, value.evaluate(model));
        })

        return result;
    }
}
