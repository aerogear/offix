/**
 * Interface for HeaderProvider
 */
export interface HeaderProvider {
  getHeaders(): {[index:string]:string};
}
