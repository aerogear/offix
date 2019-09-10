// import { expect } from "chai";
// import { requestWithConflict, requestWithOnlineDirective } from "./mock/operations";
// import { TestLink } from "./mock/TestUtils";
// import { ApolloLink, execute } from "apollo-link";
// import { BaseLink } from "../src/conflicts/BaseLink";
// import { VersionedState } from "../src/conflicts/state/VersionedState";

// describe("BaseLinkTest", () => {
//   const state = new VersionedState();
//   const baseLink = new BaseLink(state);
//   let testLink: TestLink;
//   let link: ApolloLink;

//   beforeEach(() => {
//     testLink = new TestLink();
//     link = ApolloLink.from([baseLink, testLink]);
//   });

//   it("ensure conflictBase state is captured correctly", () => {
//     requestWithConflict.context = {
//       cache: {
//         data: {
//           data: {
//             "Task:0": {
//               title: "a title",
//               description: "a description",
//               version: 1
//             }
//           }
//         }
//       },
//       getCacheKey: (config: any) => {
//         return "Task:0";
//       }
//     };
//     execute(link, requestWithConflict).subscribe({});
//     expect(testLink.operations.length).equal(1);
//     expect(testLink.operations[0].getContext().conflictBase.title).equal("a title");
//     expect(testLink.operations[0].getContext().conflictBase.description).equal("a description");
//     expect(testLink.operations[0].getContext().conflictBase.version).equal(1);
//   });

//   it("ensure conflict is thrown when conflict exists", () => {
//     requestWithOnlineDirective.context = {
//       cache: {
//         data: {
//           data: {
//             "Task:0": {
//               title: "a title",
//               description: "a description",
//               version: 1
//             }
//           }
//         }
//       },
//       getCacheKey: (config: any) => {
//         return "Task:0";
//       }
//     };
//     execute(link, requestWithOnlineDirective);
//     expect(testLink.operations.length).equal(0);
//   });
// });
