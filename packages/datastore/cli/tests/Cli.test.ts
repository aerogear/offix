import * as util from 'util';
import { mkdirSync, rmdirSync, readFileSync, existsSync } from "fs";
import { join } from 'path';

beforeEach(() => {
  if (!existsSync("./output/"))
    mkdirSync("./output/")
});
afterEach(() => rmdirSync("./output/", { recursive: true }));

test("generate", async () => {
  const exec = util.promisify(require('child_process').exec);
  const cliExec = join(__dirname, '../bin/offix.js');
  const schemaPath = join(__dirname, './mock.graphql');

  await exec(`node ${cliExec} generate --schema ${schemaPath} --outputPath output/`);
  const schema = readFileSync("./output/schema.json").toString();
  const index = readFileSync("./output/index.ts").toString();
  const types = readFileSync("./output/types.ts").toString();

  expect(types).toMatchSnapshot();
  expect(schema).toMatchSnapshot();
  expect(index).toMatchSnapshot();
});
