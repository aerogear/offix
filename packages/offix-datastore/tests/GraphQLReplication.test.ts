import { GraphQLCrudQueryBuilder } from "../src/replication";
import { DataStore } from "../src/DataStore";

test("Test Query generation", () => {
    const dataStore = new DataStore("test");
    const model = dataStore.create<any>("Test", "test", {
        id: {
            type: "ID",
            key: "id"
        },
        title: {
            type: "String",
            key: "title"
        }
    });
    const queryBuilder = new GraphQLCrudQueryBuilder();
    const queries = queryBuilder.build([model]);
    const modelQueries = queries.get(model.getName());

    expect(modelQueries).toMatchSnapshot();
});
