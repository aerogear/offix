/**
 * Interface used for for classes that will collect metrics
 */
export interface Metrics {
  /**
   * A identifier that is used to namespace the metrics data
   *
   * @return identifier string
   */
  identifier: string;

  /**
   * Function called when metrics need to be collected
   *
   * @return metrics dictionary object that contains metrics data
   */
  collect(): Promise<any>;
}
