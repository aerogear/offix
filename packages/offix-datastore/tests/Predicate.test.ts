import { createPredicate } from "../src/predicates";

test("Create predicate to filter based on one check", () => {
    const model = {
        numberOfTasks: 5,
        __typename: "Note"
    };

    const predicate = createPredicate(model);
    const predicateFunction = predicate.numberOfTasks("eq", model.numberOfTasks);
    const list = [
        model, {
            numberOfTasks: 4,
            __typename: "Note"
        }
    ];
    expect(predicateFunction.filter(list)).toEqual([model]);
});

test("'or' filter group ", () => {
    const firstNote = {
        numberOfTasks: 5,
        __typename: "Note"
    };
    const secondNote = {
        numberOfTasks: 4,
        __typename: "Note"
    };

    const predicate = createPredicate(firstNote);
    const predicateFunction = predicate.or(
        predicate.numberOfTasks("eq", firstNote.numberOfTasks),
        predicate.numberOfTasks("eq", secondNote.numberOfTasks),
        predicate.numberOfTasks("gt", firstNote.numberOfTasks - 1)
    );
    const list = [
        firstNote, secondNote, { numberOfTasks: 3, __typename: "Note" }
    ];
    expect(predicateFunction.filter(list)).toEqual([firstNote, secondNote]);
});

test("'and' filter group ", () => {
    const firstNote = {
        numberOfTasks: 5,
        __typename: "Note"
    };
    const secondNote = {
        numberOfTasks: 4,
        __typename: "Note"
    };

    const predicate = createPredicate(firstNote);
    const predicateFunction = predicate.and(
        predicate.numberOfTasks("eq", firstNote.numberOfTasks),
        predicate.numberOfTasks("eq", secondNote.numberOfTasks)
    );
    const list = [
        firstNote, secondNote
    ];
    expect(predicateFunction.filter(list)).toEqual([]);
});

test("'not' filter group ", () => {
    const firstNote = {
        numberOfTasks: 5,
        __typename: "Note"
    };
    const secondNote = {
        numberOfTasks: 4,
        __typename: "Note"
    };

    const predicate = createPredicate(firstNote);
    const predicateFunction = predicate.not(
        predicate.numberOfTasks("eq", firstNote.numberOfTasks)
    );
    const list = [
        firstNote, secondNote
    ];
    expect(predicateFunction.filter(list)).toEqual([secondNote]);
});

test("combination group", () => {
    const firstNote = {
        numberOfTasks: 5,
        __typename: "Note"
    };
    const secondNote = {
        numberOfTasks: 4,
        __typename: "Note"
    };

    const p = createPredicate(firstNote);
    const predicateFunction = p.not(p.and(
        p.not(p.numberOfTasks("eq", firstNote.numberOfTasks)),
        p.not(p.numberOfTasks("eq", secondNote.numberOfTasks))
    ));
    expect(predicateFunction.filter([
        firstNote, secondNote
    ])).toEqual([firstNote, secondNote]);
});
