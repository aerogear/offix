import { PredicateFunction, ModelFieldPredicate, PredicateExpression } from "../../predicates";

/**
 * @param predicate predicate you wish to be transformed to filter.
 */
export function convertPredicateToFilter(predicate: PredicateFunction): any {
  if (predicate instanceof ModelFieldPredicate) {
    return {
      [predicate.getKey()]: { [predicate.getOperator().op]: predicate.getValue() }
    };
  }
  const expression: PredicateExpression = predicate as PredicateExpression;
  return {
    [expression.getOperator().op]: expression.getPredicates().map((p) => convertPredicateToFilter(p))
  };
}
