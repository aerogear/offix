const { TestxServer, TestxController } = require("graphql-testx");

(async () => {
    const server = new TestxServer({
        schema: `
            type Task {
                id: ID!
                version: Int
                title: String!
                description: String!
                author: String
            }`
    });
    const controller = new TestxController(server);
    await controller.start(4002);
    console.log(`✖️ TestX Controller started at ${await controller.httpUrl()}`)
})().catch(e => console.error(e))
