import test from "ava";
import { VersionedObjectState } from "../src/states/VersionedObjectState";

test("With conflict", (t) => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear", version: 1 };
  const clientData = { name: "Red Hat", version: 2 };
  t.true(objectState.checkForConflict(serverData, clientData) !==  undefined);
});

test("Without conflict", (t) => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear", version: 1 };
  const clientData = { name: "AeroGear", version: 1 };

  t.true(objectState.checkForConflict(serverData, clientData) === undefined);
  t.deepEqual(clientData.version, 2);
});

test("Missing version", (t) => {
  const objectState = new VersionedObjectState();
  const serverData = { name: "AeroGear" };
  const clientData = { name: "AeroGear", version: 1 };

  t.throws(() => {
    objectState.checkForConflict(serverData, clientData);
  });
});
