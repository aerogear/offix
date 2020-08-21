import { updateResult, CRUDEvents } from "../src";

test("it shoud update result for add", () => {
    const state: any = {};
    const event = {
        eventType: CRUDEvents.ADD, data: [{ title: "Test" }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual(event.data);
});

test("it shoud update result for update", () => {
    const state: any = { data: [{ title: "Test" }] };
    const event = {
        eventType: CRUDEvents.UPDATE, data: [{ title: "Test", pass: true }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual(event.data);
});

test("it shoud update result for delete", () => {
    const state: any = {};
    const event = {
        eventType: CRUDEvents.DELETE, data: [{ title: "Test" }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual([]);
});
