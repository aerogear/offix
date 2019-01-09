import {HeaderProvider} from "./HeaderProvider";

/**
 * Default HeaderProvider implementation which does nothing.
 */
export class DefaultHeaderProvider implements HeaderProvider {
  public getHeaders(): {[index:string]:string} {
    return {};
  }
}
