import { Maybe } from "graphql/jsutils/Maybe";
import { ref } from "vue";
import { CRUDEvents, useDatastoreHooks } from "../src";
import { ReactiveState } from "../src/vue/StateUtils";

describe("vue hooks test suite", () => {
  const originState: ReactiveState<Record<string, unknown>> = {
    data: [],
    error: null,
    loading: false,
  };
  const stateCopy = (title?: Maybe<string>) => {
    const copy = JSON.parse(JSON.stringify(originState)) as ReactiveState<
      Record<string, unknown>
    >;
    if (title) copy.data.push({ title });
    return copy;
  };

  test("it should update result for add", () => {
    const state = ref(stateCopy());
    const event = {
      eventType: CRUDEvents.ADD,
      data: [{ title: "Test" }],
    };
    const result = useDatastoreHooks.updateResult(state, event, "title");

    expect(result).toEqual(event.data);
  });

  test("it should update result for update", () => {
    const state = ref(stateCopy("Test"));
    const event = {
      eventType: CRUDEvents.UPDATE,
      data: [{ title: "Test", pass: true }],
    };
    const result = useDatastoreHooks.updateResult(state, event, "title");

    expect(result).toEqual(event.data);
  });

  test("it should update id on ID_SWAP event", () => {
    const state = ref(stateCopy("Test"));
    const event = {
      eventType: CRUDEvents.ID_SWAP,
      data: [
        {
          previous: { title: "Test", pass: true },
          current: { title: "NewTest", pass: true },
        },
      ],
    };
    const result = useDatastoreHooks.updateResult(state, event, "title");

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(event.data[0].current);
  });

  test("it should update result for delete", () => {
    const state = ref(stateCopy());
    const event = {
      eventType: CRUDEvents.DELETE,
      data: [{ title: "Test" }],
    };
    const result = useDatastoreHooks.updateResult(state, event, "title");

    expect(result).toEqual([]);
  });
});
