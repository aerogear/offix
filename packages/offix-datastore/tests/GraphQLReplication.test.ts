import { DataStore } from "../src/DataStore";
import { Model } from "../src/Model";
import { CRUDEvents } from "../src/storage";
import { GraphQLDocuments } from "../src/replication/api/Documents";
import { buildGraphQLCRUDQueries, GraphQLCRUDReplicator } from "../src/replication";

let model: Model<any>;
let queries: Map<string, GraphQLDocuments>;
let modelQueries: GraphQLDocuments;

beforeAll(() => {
  const dataStore = new DataStore({ dbName: "test", url: "" });
  model = dataStore.createModel<any>({
    name: "Note",
    fields: {
      id: {
        type: "ID",
        key: "id"
      },
      title: {
        type: "String",
        key: "title"
      }
    }
  });

  queries = buildGraphQLCRUDQueries([model]);
  modelQueries = (queries.get(model.getStoreName()) as GraphQLDocuments);
});

test("Test Query generation", () => {
  expect(modelQueries).toMatchSnapshot();
});

test("Push mutation to GraphQL Server", (done) => {
  const input = { title: "test" };

  const graphQLReplicaionAPI = new GraphQLCRUDReplicator({
    mutate: async (query: any, variables: any) => {
      expect(query).toEqual(modelQueries.mutations.create);
      expect(variables.input).toEqual(input);
      done();
      return { data: null, errors: [] };
    }
  } as any, queries);

  graphQLReplicaionAPI.push({
    eventType: CRUDEvents.ADD,
    input,
    storeName: model.getStoreName()
  });
});
