import { createPredicate } from "../src/predicates";
import { Fields } from "../src/Model";

interface Test {
  numberOfTasks: number;
}

const testFields: Fields<Test> = {
  numberOfTasks: {
    type: "Number",
    key: "numberOfTasks"
  }
};

test("Create predicate to filter based on one check", () => {
  const predicate = createPredicate(testFields);
  const predicateFunction = predicate.numberOfTasks("eq", 5);
  const list = [
    {
      numberOfTasks: 5
    },
    {
      numberOfTasks: 4
    }
  ];
  expect(predicateFunction.filter(list)[0].numberOfTasks).toEqual(5);
});

test("'or' filter group ", () => {
  const firstNote = {
    numberOfTasks: 5
  };
  const secondNote = {
    numberOfTasks: 4
  };

  const predicate = createPredicate(testFields);
  const predicateFunction = predicate.or(
    predicate.numberOfTasks("eq", firstNote.numberOfTasks),
    predicate.numberOfTasks("eq", secondNote.numberOfTasks),
    predicate.numberOfTasks("gt", firstNote.numberOfTasks - 1)
  );
  const list = [
    firstNote, secondNote, { numberOfTasks: 3 }
  ];
  expect(predicateFunction.filter(list)).toEqual([firstNote, secondNote]);
});

test("'and' filter group ", () => {
  const firstNote = {
    numberOfTasks: 5
  };
  const secondNote = {
    numberOfTasks: 4
  };

  const predicate = createPredicate(testFields);
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
    numberOfTasks: 5
  };
  const secondNote = {
    numberOfTasks: 4
  };

  const predicate = createPredicate(testFields);
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
    numberOfTasks: 5
  };
  const secondNote = {
    numberOfTasks: 4
  };

  const p = createPredicate(testFields);
  const predicateFunction = p.not(p.and(
    p.not(p.numberOfTasks("eq", firstNote.numberOfTasks)),
    p.not(p.numberOfTasks("eq", secondNote.numberOfTasks))
  ));
  expect(predicateFunction.filter([
    firstNote, secondNote
  ])).toEqual([firstNote, secondNote]);
});
