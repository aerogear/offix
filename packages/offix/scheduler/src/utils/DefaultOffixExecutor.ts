import { OffixSchedulerExecutor } from "../OffixSchedulerExecutor";

export class DefaultOffixExecutor implements OffixSchedulerExecutor {
  public async execute(options: any) {
    console.info("default executor called with following options", options);
  }
}
