import { VersionedObjectState } from "../src/states/VersionedObjectState";

test("With conflict", () => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear", version: 1 };
  const clientData = { name: "Red Hat", version: 2 };
  expect(objectState.checkForConflict(serverData, clientData)).not.toBe(undefined);
});

test("Without conflict", () => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear", version: 1 };
  const clientData = { name: "AeroGear", version: 1 };

  expect(objectState.checkForConflict(serverData, clientData)).toBe(undefined);
  expect(clientData.version).toBe(2);
});

test("Missing version", () => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear" };
  const clientData = { name: "AeroGear", version: 1 };

  expect(() => objectState.checkForConflict(serverData, clientData)).toThrow();
});
