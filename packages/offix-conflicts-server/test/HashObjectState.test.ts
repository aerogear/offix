import { HashObjectState } from "../src/states/HashObjectState";

test("With conflict", () => {
  const hashMethod = (data: any) => JSON.stringify(data);
  const objectState = new HashObjectState(hashMethod);
  const serverData = { name: "AeroGear", ignoredProperty: "test", version: 1 };
  const clientData = { name: "Red Hat", version: 1};
  expect(objectState.checkForConflict(serverData, clientData)).not.toBe(undefined);
});
