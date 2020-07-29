import { PredicateFunction, PredicateExpression, ModelFieldPredicate } from "../../../predicates";

const getIndexedOperations = (predicate: PredicateFunction): any[] => {
    if (predicate instanceof PredicateExpression) {
        return predicate.getPredicates()
            .map(getIndexedOperations);
    }
    const mFPredicate = predicate as ModelFieldPredicate;
    const fieldInfo = mFPredicate.getFieldInfo();

    if (!fieldInfo.index) { return []; }

    return [{
        key: mFPredicate.getKey(),
        operator: mFPredicate.getOperator(),
        value: mFPredicate.getValue(),
    }];
}

const getDataForPredicate = (predicate: ModelFieldPredicate) => {
    if (predicate.getFieldInfo().index) {
        return []; // use index to retrieve data
    }
    return []; // return all
}

const handleAndExpression = (predicates: PredicateFunction[]) => {
    let data: any[] = [];
    // TODO
    // To reduce search space here
    // it seems reasonable to use most constraining index
    // and filter the data returned by most constraining index
    return data;
}

const handleNotExpression = (predicates: PredicateFunction[]) => {
    // TODO
    // if child is indexed, search all > x and all < x
    // else search all
    return [];
}

const handleOrExpression = (predicates: PredicateFunction[]) => {
    // TODO
    // use least constraining index
    // filter the rest data
    return [];
}

export const executePredicate = (predicate: PredicateFunction): any[] => {
    if (predicate instanceof ModelFieldPredicate) {
        return getDataForPredicate(predicate as ModelFieldPredicate);
    }
    const expression = predicate as PredicateExpression;
    const predicates = expression.getPredicates();
    const expOperator = expression.getOperator();

    switch (expOperator.op) {
        case "not":
            return handleNotExpression(predicates);

        case "or":
            return handleOrExpression(predicates);

        case "and":
            return handleAndExpression(predicates);

        default:
            throw new Error("Invalid predicate");
    } 
}
