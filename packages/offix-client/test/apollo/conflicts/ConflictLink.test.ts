import {
  ConflictLink,
  ConflictInfo
} from "../../../src/apollo/conflicts/ConflictLink";
import { GraphQLError } from "graphql";
import { VersionedState } from "offix-conflicts-client";

/**
 * Return any so that we can test private methods
 */
function newConflictLink(): any {
  return new ConflictLink({ conflictProvider: new VersionedState() });
}

test("get conflict error from generic graphql errors", () => {
  const link = newConflictLink();
  const result = link.getConflictData([new GraphQLError("a generic error")]);
  expect(result).toBeUndefined();
});

test("get conflict error from graphql error with generic extensions", () => {
  const link = newConflictLink();
  const result = link.getConflictData([
    new GraphQLError(
      "some error",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {}
    )
  ]);
  expect(result).toBeUndefined();
});

test("get conflict error from conflict error", () => {
  const conflictInfo: ConflictInfo = {
    serverState: {},
    clientState: {},
    returnType: "MyType"
  };

  const link = newConflictLink();
  const result = link.getConflictData([
    new GraphQLError("some other errors"),
    new GraphQLError(
      "some error",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { exception: { conflictInfo } }
    )
  ]);
  expect(result).toEqual(conflictInfo);
});
