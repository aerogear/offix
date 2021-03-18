import * as util from "util";
import { rmdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { makeDirIfNotExists } from "../src/utils";

const defaultSchemaPath = "./src/models";
const defaultOutputPath = "./src/datasync/generated";

beforeEach(() => {
  makeDirIfNotExists("./output/");
  const schemaPath = join(__dirname, "./mock.graphql");
  const graphqlSchema = readFileSync(schemaPath);

  makeDirIfNotExists(defaultSchemaPath);
  writeFileSync(`${defaultSchemaPath}/mock.graphql`, graphqlSchema);
});

afterEach(() => {
  rmdirSync("./output/", { recursive: true });
  rmdirSync(defaultSchemaPath, { recursive: true });
  rmdirSync("./src/datasync/", { recursive: true });
});

test("generate with positional arguments", async () => {
  // eslint-disable-next-line
  const exec = util.promisify(require("child_process").exec);
  const cliExec = join(__dirname, "../bin/offix.js");
  const schemaPath = join(__dirname, "./mock.graphql");

  await exec(`node ${cliExec} generate ${schemaPath} output/`);
  const schema = readFileSync("./output/schema.json").toString();
  const index = readFileSync("./output/index.ts").toString();
  const types = readFileSync("./output/types.ts").toString();

  expect(types).toMatchSnapshot();
  expect(schema).toMatchSnapshot();
  expect(index).toMatchSnapshot();
});

test("generate with defaults", async () => {
  // eslint-disable-next-line
  const exec = util.promisify(require("child_process").exec);
  const cliExec = join(__dirname, "../bin/offix.js");

  await exec(`node ${cliExec} generate`);
  const schema = readFileSync(`${defaultOutputPath}/schema.json`).toString();
  const index = readFileSync(`${defaultOutputPath}/index.ts`).toString();
  const types = readFileSync(`${defaultOutputPath}/types.ts`).toString();

  expect(types).toMatchSnapshot();
  expect(schema).toMatchSnapshot();
  expect(index).toMatchSnapshot();
});
