import { expect } from "chai";
import { requestWithMultipleDirectives, requestWithOnlineDirective } from "./operations";
import { TestLink } from "./TestUtils";
import { ApolloLink, execute } from "apollo-link";
import { LocalDirectiveFilterLink } from "../src/links/LocalDirectiveFilterLink";
import { hasDirectives } from "apollo-utilities";

describe("LocalDirectives", () => {
  const directiveFilterLink = new LocalDirectiveFilterLink();
  let testLink: TestLink;
  let link: ApolloLink;

  beforeEach(() => {
    testLink = new TestLink();
    link = ApolloLink.from([directiveFilterLink, testLink]);
  });

  it("ensures online only directive does not exist after local link", () => {
    expect(hasDirectives(["onlineOnly"], requestWithOnlineDirective.query));
    execute(link, requestWithOnlineDirective).subscribe({});
    expect(testLink.operations.length).equal(1);
    expect(!(hasDirectives(["onlineOnly"], testLink.operations[0].query)));
  });

  it("ensures multiple directives do not exist after local link", () => {
    expect(hasDirectives(["noSquash", "onlineOnly"], requestWithMultipleDirectives.query));
    execute(link, requestWithMultipleDirectives).subscribe({});
    expect(testLink.operations.length).equal(1);
    expect(!(hasDirectives(["noSquash", "onlineOnly"], testLink.operations[0].query)));
  });
});
