import { OffixExecutor } from "../Offix";

export class DefaultOffixExecutor implements OffixExecutor {
  public async execute(options: any) {
    console.info("default executor called with following options", options);
  }
}
