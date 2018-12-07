import { compositeQueueLink } from "../src/links/compositeQueueLink";
import { OperationQueueEntry, OfflineQueueLink } from "../src/links/OfflineQueueLink";
import { expect } from "chai";
import { op, opWithDifferentQuery, requestWithNoSquashDirective } from "./operations";
import {
  TestLink
} from "./TestUtils";
import { ApolloLink, execute } from "apollo-link";
import { PersistentStore, PersistedData } from "../src/PersistentStore";
import { LocalDirectiveFilterLink } from "../src/links/LocalDirectiveFilterLink";
import { hasDirectives } from "apollo-utilities";

const localStorage: PersistentStore<PersistedData> = {
  getItem: (key: string) => {
    return {};
  },
  setItem: (key: string, data: PersistedData) => {
    console.info("save data", data);
  },
  removeItem: (key: string) => {
    console.info("remove data", key);
  }
};

describe("LocalDirectives", () => {
  const config = { mutationsQueueName: "test", storage: localStorage };
  let link: ApolloLink;
  let directiveLink: ApolloLink;
  let testLink: TestLink;
  let onOffQueueLink: OfflineQueueLink;
  let opQueue: OperationQueueEntry[] = [];
  let operations: any[] = [];

  beforeEach(() => {
    opQueue = [];
    testLink = new TestLink();
    onOffQueueLink = new OfflineQueueLink(config);
    directiveLink = new LocalDirectiveFilterLink();
    link = ApolloLink.from([onOffQueueLink, directiveLink, testLink]);
    operations = [];
  });

  it("ensures directive does not exist after local link", () => {
    const storageEngine = {
      getItem() {
        return operations;
      },
      removeItem() {
        operations = [];
      },
      setItem(key: string, content: any) {
        console.info(content);
        operations = JSON.parse(content);
      }
    };
    onOffQueueLink.close();
    execute(link, requestWithNoSquashDirective);
    expect(hasDirectives(["noSquash"], requestWithNoSquashDirective.query));
    expect(storageEngine.getItem().length).eq(1);
    console.info(storageEngine.getItem());
  });
});
