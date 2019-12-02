const { TestxServer, TestxController } = require("graphql-testx");
const { Server, config } = require("karma");
const path = require("path");

async function test() {

  // create generic integration_test
  const graphqlServer = require("./server")

  // create the TestxServer and the TestxController
  const testxServer = new TestxServer(`
    type Task {
      id: ID!
      version: Int
      title: String!
      description: String!
      author: String
    }`);
  const testxController = new TestxController(testxServer);
  await testxController.start();
  const testxUrl = await testxController.httpUrl();

  // promisify Karma tests
  await new Promise((resolve, reject) => {
    // Read karma config
    const karmaConfig = config.parseConfig(path.join(__dirname, "karma.conf.js"));

    // Pass the TestxController url to the tests
    // __karma__.config.args[0]
    karmaConfig.client.args = [testxUrl];

    // Initialize Karma
    const karma = new Server(
      karmaConfig,
      exitCode => {
        if (exitCode === 0) {
          resolve();
        } else {
          reject(new Error(`karma tests failed with code: ${exitCode}`));
        }
      }
    );

    // Start Karma tests
    karma.start();
  });

  graphqlServer.close();
  await testxController.close();
}

exports.test = test;
