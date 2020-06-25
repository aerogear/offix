/**
 * A PredicateFunction filters data that match its conditions.
 * The conditions for any PredicateFunction is specified by overriding the evaluate method
 */
export abstract class PredicateFunction {
    public filter(models: any[]) {
        return models.filter((m) => this.evaluate(m));
    }

    public abstract evaluate(model: any): boolean;
}


/**
 * A ModelFieldPredicate is a PredicateFunction that filters
 * data by checking that a data field passes the condition
 * specified by the operator.
 */
export class ModelFieldPredicate extends PredicateFunction {
    constructor(
        private key: string,
        private value: any,
        private operator: Function
    ) {
        super();
    }

    public evaluate(model: any) {
        return this.operator(model[this.key], this.value);
    }
}

/**
 * A Logical Expression Operator.
 */
export interface ExpressionOperator {
    /**
     * Performs a logical operation on its inputs
     *
     * @param previousResult
     * @param currentResult
     * @returns result of operation on the previousResult and the currentResult
     */
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
};

/**
 * A PredicateExpresion is a PredicateFunction that
 * filters data by performing a
 * logical operation on two or more PredicateFunctions
 */
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
        });

        return result;
    }
}
