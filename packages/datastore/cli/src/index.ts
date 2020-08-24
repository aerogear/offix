import yargs from "yargs";
import { generate } from "./generate";

export { generate };
export { OffixDataSyncPlugin as Plugin } from "./OffixDataSyncPlugin";

export const cmd = () => {
  // eslint-disable-next-line no-unused-expressions
  yargs
    .command(
      "generate",
      "Generate Datastore config",
      {
        schema: {
          describe: "The schema path",
          default: "./src/models/mock.graphql"
        },
        outputPath: {
          describe: "The output dir path",
          default: "./src/datasync/generated"
        }
      },
      (argv) => generate(argv.schema as string, argv.outputPath as string)
    )
    .demandCommand(1)
    .help()
    .argv;
};
