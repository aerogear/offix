const equalsOperator = (modelField: any, value: any) => modelField === value;
const gtOperator = (modelField: any, value: any) => modelField > value;

export const AllOperators: any = {
    "eq": equalsOperator,
    "gt": gtOperator
};
