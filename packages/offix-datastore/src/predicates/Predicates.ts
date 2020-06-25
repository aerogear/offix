import { ExpressionOperators, ModelFieldPredicate, PredicateExpression, PredicateFunction } from "./PredicateFunctions";
import { AllOperators } from "./Operators";
import { Fields } from "../Model";

export type ModelPredicate<T> = {
    [P in keyof Required<T>]: (op: string, value: T[P]) => ModelFieldPredicate
} & {
    or: (...predicates: PredicateFunction[]) => PredicateExpression;
    and: (...predicates: PredicateFunction[]) => PredicateExpression;
    not: (...predicates: PredicateFunction[]) => PredicateExpression;
};

export type Predicate<T> = (p: ModelPredicate<T>) => PredicateFunction;

export function createPredicate<T>(fields: Fields<T>): ModelPredicate<T> {
    const modelPredicate: any = {};

    Object.keys(fields).forEach((key: string) => {
        modelPredicate[key] = (op: string, value: any) => new ModelFieldPredicate(key, value, AllOperators[op]);
    });

    modelPredicate.or = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.or);
    };
    modelPredicate.and = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.and);
    };
    modelPredicate.not = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.not);
    };

    return modelPredicate;
}
