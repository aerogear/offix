import * as util from 'util';
import { mkdirSync, rmdirSync, readFileSync } from "fs";
import { join } from 'path';

beforeEach(() => mkdirSync("./output/"));
afterEach(() => rmdirSync("./output/", { recursive: true }));

test("generate", async () => {
    const exec = util.promisify(require('child_process').exec);
    const cliExec = join(__dirname, '../dist/index.js');
    const schemaPath = join(__dirname, './mock.graphql');

    await exec(`node ${cliExec} generate --schema ${schemaPath} --outputPath output/`);
    const schema = readFileSync("./output/schema/schema.json");
    const schemaIndex = readFileSync("./output/schema/index.ts");
    const config = readFileSync("./output/config.ts");

    expect(config).toBeDefined();
    expect(schema).toBeDefined();
    expect(schemaIndex).toBeDefined();
});
