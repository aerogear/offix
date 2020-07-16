import { DataStore } from "../src/DataStore";
import { Model } from "../src/Model";
import { CRUDEvents } from "../src/storage";
import { GraphQLDocuments } from "../src/replication/api/Documents";
import { buildGraphQLCRUDQueries, GraphQLCRUDReplicator, convertPredicateToFilter } from "../src/replication";
import { createPredicate } from "../src/predicates";

let model: Model<any>;
let queries: Map<string, GraphQLDocuments>;
let modelQueries: GraphQLDocuments;

beforeAll(() => {
  const dataStore = new DataStore({ dbName: "test", clientConfig: { url: "" } });
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

  const graphQLReplicaionAPI = new GraphQLCRUDReplicator({} as any, queries);

  graphQLReplicaionAPI.mutate = async (query: any, variables: any) => {
    expect(query).toEqual(modelQueries.mutations.create);
    expect(variables.input).toEqual(input);
    done();
    return { data: null, errors: [] };
  };

  graphQLReplicaionAPI.push({
    eventType: CRUDEvents.ADD,
    input,
    storeName: model.getStoreName()
  });
});

describe("Predicate to GraphQL query conversion", () => {
  test("Convert ModelField Predicates", () => {
    const mp = createPredicate(model.getFields());
    const predicateFunction = mp.title("eq", "test");
    const result = convertPredicateToFilter(predicateFunction);
    const expectedResult = {
      title: { eq: "test" }
    };
    expect(result).toEqual(expectedResult);
  });

  test("Convert Expression Predicates", () => {
    const mp = createPredicate(model.getFields());
    const predicateFunction = mp.or(
      mp.title("eq", "test"), mp.title("endsWith", "st"));
    const result = convertPredicateToFilter(predicateFunction);
    const expectedResult = {
      or: [
        { title: { eq: "test" } },
        { title: { endsWith: "st" } }
      ]
    };
    expect(result).toEqual(expectedResult);
  });

  test("Convert Expression of Expression Predicates", () => {
    const mp = createPredicate(model.getFields());
    const predicateFunction = mp.or(
      mp.and(mp.title("eq", "test"), mp.title("endsWith", "st")),
      mp.and(mp.title("eq", "test"), mp.title("startsWith", "ts"))
    );
    const result = convertPredicateToFilter(predicateFunction);
    const expectedResult = {
      or: [
        {
          and: [
            { title: { eq: "test" } },
            { title: { endsWith: "st" } }
          ]
        },
        {
          and: [
            { title: { eq: "test" } },
            { title: { startsWith: "ts" } }
          ]
        }
      ]
    };
    expect(result).toEqual(expectedResult);
  });
});
