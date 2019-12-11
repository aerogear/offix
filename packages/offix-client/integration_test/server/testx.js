const { TestxServer, TestxController } = require("graphql-testx");
const { CRUDService } = require("graphback");
const { conflictHandler } = require('offix-server-conflicts');

class CustomCRUDService extends CRUDService {
    async update(name, id, data, options, context) {
        const server = (await this.db.findBy(name, { id }))[0]
        const client = { id, ...data }
        const conflict = conflictHandler.checkForConflict(server, client)
        if (conflict) {
            throw conflict;
        }
        return super.update(name, id, client, options, context);
    }
}

(async () => {
    const server = new TestxServer({
        schema: `
            type Task {
                id: ID!
                version: Int
                title: String!
                description: String!
                author: String
            }`,
        serviceBuilder: (data, sub) => new CustomCRUDService(data, sub)
    });
    const controller = new TestxController(server);
    await controller.start(4002);
    console.log(`✖️ TestX Controller started at ${await controller.httpUrl()}`)
})().catch(e => console.error(e))
