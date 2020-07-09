import { ExpressionOperators, ModelFieldPredicate, PredicateExpression, PredicateFunction } from "./PredicateFunctions";
import { OperatorFunctionMap, TypeOperatorMap, AllOperators } from "./Operators";
import { Fields } from "../Model";

/**
 * Defines the fields that can be used for filtering in a predicate for a given type
 */
export type ModelPredicate<T> = {
    [P in keyof Required<T>]: (op: TypeOperatorMap<T[P]>, input: T[P] | T[P][]) => ModelFieldPredicate
} & {
    or: (...predicates: PredicateFunction[]) => PredicateExpression;
    and: (...predicates: PredicateFunction[]) => PredicateExpression;
    not: (...predicates: PredicateFunction[]) => PredicateExpression;
};

/**
 * Defines the predicate function type for a given type
 */
export type Predicate<T> = (p: ModelPredicate<T>) => PredicateFunction;

/**
 * Creates the ModelPredicate object for the given fields
 *
 * @param fields the fields to be used for filtering
 */
export function createPredicate<T>(fields: Fields<T>): ModelPredicate<T> {
    const modelPredicate: any = {};

    Object.keys(fields).forEach((key: string) => {
        modelPredicate[key] = (op: AllOperators, input: any) => new ModelFieldPredicate(key, input, OperatorFunctionMap[op]);
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
