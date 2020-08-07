import traverse from "traverse";

// given an object with a structure we don't know,
// replace all instances of the targetValue with the newValue
export function deepUpdateValueInObject(obj: any, targetValue: any, newValue: any): void {
  traverse(obj).forEach(function(val) {
    if (this.isLeaf && val && val === targetValue) {
      this.update(newValue);
    }
  });
}
