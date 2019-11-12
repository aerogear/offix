import { ConflictHandler } from "../src//handler/ConflictHandler";
import { ConflictListener, ConflictResolutionStrategy, UseClient } from "../src";
import { VersionedState } from "../src/state/VersionedState";

const listener: ConflictListener = {
  conflictOccurred(listenerBase: any, listenerClient: any, listenerServer: any) {
    return "conflictOccurred";
  },
  mergeOccurred(listenerBase: any, listenerClient: any, listenerServer: any) {
    return "mergeOccurred";
  }
};
const strategy: ConflictResolutionStrategy = UseClient;

const objectState = new VersionedState();
const nonConflictedSet = {
  base: {
    title: "a title",
    description: "a description"
  },
  client: {
    title: "client updated title",
    description: "a description"
  },
  server: {
    title: "a title",
    description: "server updated description"
  }
};

const conflictedTitle = {
  base: {
    title: "a title",
    description: "a description"
  },
  client: {
    title: "client updated title",
    description: "a description"
  },
  server: {
    title: "server updated title",
    description: "server updated description"
  }
};

const conflictedSet = {
  base: {
    title: "a title",
    description: "a description"
  },
  client: {
    title: "client updated title",
    description: "client updated description"
  },
  server: {
    title: "server updated title",
    description: "server updated description"
  }
};

it("ensure conflicted is set to false", () => {
  const handler = new ConflictHandler({...nonConflictedSet, strategy, listener, objectState, operationName: "test"});
  expect(handler.conflicted).toBe(false);
});

it("ensure conflicted is set to true", () => {
  const handler = new ConflictHandler({...conflictedSet, strategy, listener, objectState, operationName: "test"});
  expect(handler.conflicted).toBe(true);
});

it("ensure data is merged", () => {
  const handler = new ConflictHandler({...nonConflictedSet, strategy, listener, objectState, operationName: "test"});
  const mergedData = handler.executeStrategy();
  expect(handler.conflicted).toBe(false);
  expect(mergedData.title).toBe("client updated title");
  expect(mergedData.description).toBe("server updated description");
});

it("ensure strategy is called", () => {
  const handler = new ConflictHandler({...conflictedSet, strategy, listener, objectState, operationName: "test"});
  const mergedData = handler.executeStrategy();
  expect(handler.conflicted).toBe(true);
  expect(mergedData.title).toBe("client updated title");
  expect(mergedData.description).toBe("client updated description");
});

it("ensure client data is persisted properly", () => {
  const handler = new ConflictHandler({...conflictedTitle, strategy, listener, objectState, operationName: "test"});
  const mergedData = handler.executeStrategy();
  expect(handler.conflicted).toBe(true);
  expect(mergedData.title).toBe("client updated title");
  expect(mergedData.description).toBe("server updated description");
});
