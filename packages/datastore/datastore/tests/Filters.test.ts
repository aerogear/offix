import { createPredicateFrom } from '../src/storage/adapters/indexedDB/Predicate';

describe("Test IndexedDB filters", () => {
    test("Filter based on object fields", () => {
        const list = [
            { clickCount: 9 }, { clickCount: 4 }
        ];
        const predicate = createPredicateFrom({ clickCount: { lt: 9, ne: 4 } });
        const result = predicate.filter(list);
        expect(result.length).toEqual(0);
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
