import { GraphQLCrudQueryBuilder, GraphQLReplicator, GraphQLQueries } from "../src/replication";
import { DataStore } from "../src/DataStore";
import { Model } from "../src/Model";

let model: Model<any>;
let queries: Map<string, GraphQLQueries>;
let modelQueries: GraphQLQueries;

beforeAll(() => {
    const dataStore = new DataStore("test");
    model = dataStore.create<any>("Test", "test", {
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
    queries = queryBuilder.build([model]);
    modelQueries = (queries.get(model.getStoreName()) as GraphQLQueries);
});

test("Test Query generation", () => {
    expect(modelQueries).toMatchSnapshot();
});

test("Push mutation to GraphQL Server", (done) => {
    const data = { title: "test" };

    const graphQLReplicaionAPI = new GraphQLReplicator({
        send: async (query, variables: any) => {
            expect(query).toEqual(modelQueries.mutations.create);
            expect(variables.input).toEqual(data);
            done();
            return { data: null, errors: [] }
        }
    }, queries);

    graphQLReplicaionAPI.push({
        eventType: "ADD",
        data,
        storeName: model.getStoreName()
    })
});
