import { ExpressionOperators, ModelFieldPredicate, PredicateExpression } from "./PredicateFunctions";
import { AllOperators } from "./Operators";
import { Model } from "../models";

export function createPredicate(model: Model) {
    const modelPredicate: any = {};

    Object.keys(model).forEach((key) => {
        if (key.startsWith("__")) return;
        modelPredicate[key] = (op: string, value: any) => new ModelFieldPredicate(key, value, AllOperators[op]);
    });

    modelPredicate.or = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.or);
    }
    modelPredicate.and = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.and);
    }
    modelPredicate.not = (...predicates: any[]) => {
        return new PredicateExpression(predicates, ExpressionOperators.not);
    }

    return modelPredicate;
}
