import { updateResult, CRUDEvents } from "../src";

test("it should update result for add", () => {
    const state: any = {};
    const event = {
        eventType: CRUDEvents.ADD, data: [{ title: "Test" }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual(event.data);
});

test("it should update result for update", () => {
    const state: any = { data: [{ title: "Test" }] };
    const event = {
        eventType: CRUDEvents.UPDATE, data: [{ title: "Test", pass: true }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual(event.data);
});

test("it should update id on ID_SWAP event", () => {
    const state: any = { data: [{ title: "Test" }] };
    const event = {
        eventType: CRUDEvents.ID_SWAP, data: [{
            previous: { title: "Test", pass: true },
            current: { title: "NewTest", pass: true }
        }]
    };
    const result = updateResult(state, event, "title");

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(event.data[0].current);
});

test("it should update result for delete", () => {
    const state: any = {};
    const event = {
        eventType: CRUDEvents.DELETE, data: [{ title: "Test" }]
    };
    const result = updateResult(state, event, "title");

    expect(result).toEqual([]);
});
