export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function objToKey<T extends Record<string, any>>(obj: T): T | string {
  if (!!obj && (obj.constructor === Object)) {
    return obj;
  }
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = objToKey(obj[key]);
      return result;
    }, {});
  return JSON.stringify(sortedObj);
}
