import traverse from "traverse";

// given an object with nested objects
// example: { a: 1, b: { c: 2, d: 3 } }
// flatten the object into top level keys
// { a: 1, c: 2, d: 3 }
// will behave unexpectedly if multiple nested objects
// use the same key value
export function flattenObject(obj: any): object {
  return traverse(obj).reduce(function(acc, val) {
    if (this.isLeaf && this.key) {
      acc[this.key] = val;
    }
    return acc;
  }, {});
}

// given an object with a structure we don't know,
// replace all instances of the targetValue with the newValue
export function deepUpdateValueInObject(obj: any, targetValue: any, newValue: any): void {
  traverse(obj).forEach(function(val) {
    if (this.isLeaf && val && val === targetValue) {
      this.update(newValue);
    }
  });
}

// Given a src object that may or may not contain nested objects.
// example: { input: { id: 123, a: 1, b: 2 } }
// and given a flat targetObject - example: { id: 123, a: 2, b: 3 }
// match the target object to the nested object by id and
// return a new object where the nested object is replaced with the target object
// result: { input: { id: 123, a: 2, b: 3 } }
export function replaceNestedObjectById(srcObject: any, targetObject: any, idField: any) {
  return traverse(srcObject).map(function(val) {
    if (val && this.notLeaf && val[idField] && val[idField].toString() === targetObject[idField].toString()) {
      this.update(targetObject, true);
    }
  });
}
