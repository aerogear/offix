import { createPredicateFrom } from '../src/storage/adapters/indexedDB/Predicate';
import { filterToSQL } from '../src/storage/adapters/websql/filterToSQL';

describe("Test IndexedDB filters", () => {
    test("Filter based on object fields", () => {
        const list = [
            { clickCount: 9 }, { clickCount: 4 }
        ];
        const predicate = createPredicateFrom({ clickCount: { lt: 9, ne: 4 } });
        const result = predicate.filter(list);
        expect(result.length).toEqual(0);
    });

    test("Assume 'eq' operation", () => {
        const list = [
            { clickCount: 9 }, { clickCount: 4 }
        ];
        const predicate = createPredicateFrom({ clickCount: 9 });
        const result = predicate.filter(list);
        expect(result).toEqual([list[0]]);
    });

    test("Filter based on expressions", () => {
        const list = [
            { clickCount: 9, isTest: true },
            { clickCount: 4, isTest: false },
            { clickCount: 4, isTest: true }
        ];
        const predicate = createPredicateFrom({
            or: {
                clickCount: { eq: 9 },
                not: {
                    and: { isTest: { eq: false }, clickCount: { eq: 4 } }
                }
            }
        });

        const result = predicate.filter(list);
        expect(result).toEqual([list[0], list[2]]);
    });
});

describe.only("Test SQL filters", () => {
    test("Filter using object fields", () => {
        const filter = {
            clickCount: { eq: 5 },
            title: { eq: 'Test' }
        };
        let expectedSQL = "WHERE (clickCount = 5 AND title = 'Test') ?";
        let actualSQL = filterToSQL(filter);
        expect(actualSQL).toEqual(expectedSQL);

        expectedSQL = "WHERE (title LIKE 'Test%') ?";
        actualSQL = filterToSQL({ title: { startsWith: 'Test' } });
        expect(actualSQL).toEqual(expectedSQL);
    });

    test("Assume 'eq' operation", () => {
        const filter = {
            clickCount: 5,
            title: 'Test'
        };
        const expectedSQL = "WHERE (clickCount = 5 AND title = 'Test') ?";
        const actualSQL = filterToSQL(filter);
        expect(actualSQL).toEqual(expectedSQL);
    });

    test("Multiple checks on one field", () => {
        const filter = {
            clickCount: {
                gt: 9,
                ne: 15
            },
        };
        const expectedSQL = "WHERE (clickCount > 9 AND clickCount != 15) ?";
        const actualSQL = filterToSQL(filter);
        expect(actualSQL).toEqual(expectedSQL);
    });

    test("Filter using expressions", () => {
        const filter = {
            or: {
                title: 'Fun',
                not: {
                    clickCount: 5,
                    title: 'Test'
                }
            }
        };

        const expectedSQL = "WHERE ((title = 'Fun' OR NOT (clickCount = 5 AND title = 'Test'))) ?";
        const actualSQL = filterToSQL(filter);
        expect(actualSQL).toEqual(expectedSQL);
    });
});
