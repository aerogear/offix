import yargs from "yargs";
import { generate } from "./generate";

export { generate };
export { OffixDataSyncPlugin as Plugin } from "./OffixDataSyncPlugin";

export const cmd = () => {
  // eslint-disable-next-line no-unused-expressions
  yargs
    .command(
      "generate [schema] [outputPath]",
      "Generate Datastore config",
      (y) => {
        y.positional("schema", {
          describe: "The schema path",
          default: "./src/models/mock.graphql",
          type: "string"
        }).positional("outputPath", {
          describe: "The output dir path",
          default: "./src/datasync/generated",
          type: "string"
        });
      },
      (argv) => generate(argv.schema as string, argv.outputPath as string)
    )
    .demandCommand(1)
    .help()
    .argv;
};
