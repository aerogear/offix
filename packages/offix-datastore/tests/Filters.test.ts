import { createPredicateFrom } from '../src/filters';

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
        { clickCount: 9, isTest: true }, { clickCount: 4, isTest: false }
    ];
    const predicate = createPredicateFrom({
        clickCount: {
            lt: 9,
            ne: 4
        },
        or: {
            isTest: { eq: true }
        }
    });
    const result = predicate.filter(list);
    expect(result.length).toEqual(1);
    expect(result[0].isTest).toEqual(true);
});
