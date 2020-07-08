const equalsOperator = (modelField: any, value: any) => modelField === value;
const gtOperator = (modelField: any, value: any) => modelField > value;

// https://github.com/aerogear/OpenVolunteerPlatform/blob/master/platform/client/src/dataFacade.tsx
// TODO ADD type safety
// TODO align operators to graphqlcrud
export const AllOperators: any = {
    "eq": equalsOperator,
    "gt": gtOperator
};
